const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = "your_secret_key"; // Change this to a secure key

app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password
    database: 'atalay' // Your database name
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.message);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Registration Route
app.post('/registration', async (req, res) => {
    try {
        const { name, email, phone_number, password, password_confirmation } = req.body;

        if (!name || !email || !phone_number || !password || !password_confirmation) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== password_confirmation) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        db.query('SELECT * FROM users WHERE email = ? OR phone_number = ?', [email, phone_number], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: "Email or phone number already registered" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const sql = 'INSERT INTO users (name, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)';
            const values = [name, email, phone_number, hashedPassword, 'customer'];

            db.query(sql, values, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Database insertion error", error: err.message });
                }
                res.status(201).json({ message: "User registered successfully" });
            });
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Login Route
app.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const user = results[0];

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

            res.status(200).json({ message: "Login successful", token });
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});



// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

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

        // Validate required fields
        if (!name || !email || !phone_number || !password || !password_confirmation) {
            return res.status(400).json({message: "All fields are required",});
        }

        // Check if passwords match
        if (password !== password_confirmation) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if email or phone number already exists
        db.query('SELECT * FROM users WHERE email = ? OR phone_number = ?', [email, phone_number], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: "Email or phone number already registered" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into database
            const sql = 'INSERT INTO users (name, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)';
            const values = [name, email, phone_number, hashedPassword, 'customer', new Date(), new Date()];

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

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

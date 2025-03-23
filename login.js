const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');  // Import CORS middleware

const app = express();
const PORT = 3000;
const SECRET_KEY = "your_secret_key"; // Change this to a secure key

app.use(cors());  // Enable CORS for all routes
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
        console.log(req.body);  // Log de request body om te zien of de gegevens goed worden ontvangen

        const { name, email, phone_number, password, password_confirmation } = req.body;

        if (!name || !email || !phone_number || !password || !password_confirmation) {
            return res.status(400).json({ message: "Alle velden zijn vereist" }); // In het Nederlands
        }

        if (password !== password_confirmation) {
            return res.status(400).json({ message: "Wachtwoorden komen niet overeen" }); // In het Nederlands
        }

        db.query('SELECT * FROM users WHERE email = ? OR phone_number = ?', [email, phone_number], async (err, results) => {
            if (err) {
                console.error("Database error: ", err);  // Log de foutmelding van de database
                return res.status(500).json({ message: "Database fout", error: err.message }); // In het Nederlands
            }

            if (results.length > 0) {
                return res.status(400).json({ message: "E-mail of telefoonnummer is al geregistreerd" }); // In het Nederlands
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const sql = 'INSERT INTO users (name, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)';
            const values = [name, email, phone_number, hashedPassword, 'customer'];

            db.query(sql, values, (err) => {
                if (err) {
                    console.error("Database insertion error: ", err);  // Log database-invoegfouten
                    return res.status(500).json({ message: "Database invoegfout", error: err.message }); // In het Nederlands
                }
                res.status(201).json({ message: "Gebruiker succesvol geregistreerd" }); // In het Nederlands
            });
        });

    } catch (error) {
        console.error("Error: ", error);  // Log eventuele serverfouten
        res.status(500).json({ message: "Interne serverfout", error: error.message }); // In het Nederlands
    }
});

// Login Route
app.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "E-mail en wachtwoord zijn vereist" }); 
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Database fout", error: err.message }); 
            }

            if (results.length === 0) {
                return res.status(401).json({ message: "Ongeldige e-mail of wachtwoord" }); 
            }

            const user = results[0];

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Ongeldige e-mail of wachtwoord" }); 
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

            res.status(200).json({ message: "Inloggen succesvol", token }); 
        });

    } catch (error) {
        res.status(500).json({ message: "Interne serverfout", error: error.message }); 
    }
});




// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

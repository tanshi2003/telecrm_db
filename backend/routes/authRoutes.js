const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const sql = `SELECT * FROM users WHERE email = ?`;
        db.query(sql, [email], async (err, results) => {
            if (err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const user = results[0];

            // ✅ Compare passwords securely
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // ✅ Generate JWT token with environment variable secret key
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET, // Load from .env
                { expiresIn: "1h" }
            );

            res.json({
                message: "✅ Login successful",
                token,
                role: user.role,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            });
        });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

module.exports = router;

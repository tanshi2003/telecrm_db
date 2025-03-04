const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json()); // Use built-in JSON parsing

// ✅ Routes
app.use("/api/auth", authRoutes);

// ✅ Test Database Connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    }
    console.log("✅ Connected to MySQL Database!");
    connection.release();  // Release back to pool
});

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/db");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// ✅ CORS FIRST — before routes!
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import Routes
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const leadRoutes = require("./routes/leadRoutes");
const campaignRoutes = require("./routes/campaignRoutes");

// Use Routes
app.use("/api/admins", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/campaigns", campaignRoutes);

// Root Endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to the API",
        data: null
    });
});

// Error handling
app.use((err, req, res, next) => {
    res.status(500).json({
        success: false,
        message: err.message,
        data: null
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});

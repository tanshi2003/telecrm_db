const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/db");
const viewsRoutes = require('./routes/viewsRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// ✅ CORS FIRST — before routes!
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // Use a more secure setting for production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Middleware
app.use(express.json()); // Using built-in express.json instead of body-parser
app.use(express.urlencoded({ extended: true })); // Using built-in express.urlencoded

// Import Routes
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const leadRoutes = require("./routes/leadRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const searchRoutes = require("./routes/searchRoutes");
const callRoutes = require("./routes/callRoutes");
const authRoutes = require('./routes/authRoutes');
const managerRoutes = require('./routes/managerRoutes');

// Use Routes
app.use("/api/admins", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/calls", callRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/Views', viewsRoutes);

// Root Endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: process.env.NODE_ENV === 'production' ? "Welcome to the production API" : "Welcome to the development API",
        data: null
    });
});

// Start the server (no need for DB connection in this case, pool is already managing it)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});

// Error handling (Global)
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error for debugging
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        data: null
    });
});

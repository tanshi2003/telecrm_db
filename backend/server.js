
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/db");
const viewsRoutes = require('./routes/viewsRoutes');
const http = require('http');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const initializeSocket = require('./socket');

// Import Routes
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const leadRoutes = require("./routes/leadRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const searchRoutes = require("./routes/searchRoutes");
const authRoutes = require('./routes/authRoutes');
const managerRoutes = require('./routes/managerRoutes');
const callRoutes = require('./routes/callRoutes');
const settingsRoutes = require('./routes/settings');
const activityRoutes = require('./routes/activityRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Configure logging
app.use(morgan('dev')); // HTTP request logger
console.log = (...args) => {
    const timestamp = new Date().toISOString();
    console.info(`[${timestamp}]`, ...args);
};

// CORS FIRST — before routes. Keep existing configured origins and allow GitHub Pages.
const allowedOrigins = new Set([
    ...(process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean),
    'https://tanshi2003.github.io',
    'https://telecrmio.netlify.app'
]);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Middleware
app.use('/api', viewsRoutes);
app.use(express.json()); // Using built-in express.json instead of body-parser
app.use(express.urlencoded({ extended: true })); // Using built-in express.urlencoded

// Activity Routes
app.use('/api/activities', activityRoutes);

// Use Routes (canonical API paths)
app.use("/api/admins", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/search", searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/settings', settingsRoutes);

// Backward-compatible root aliases for older frontend pages that omit /api.
app.use("/admins", adminRoutes);
app.use("/users", userRoutes);
app.use("/leads", leadRoutes);
app.use("/campaigns", campaignRoutes);

// Additive schema bootstrap for deployments where the leads table is missing.
db.query(`CREATE TABLE IF NOT EXISTS leads (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NULL,
    status ENUM('New','Contacted','Follow-Up Scheduled','Interested','Not Interested','Call Back Later','Under Review','Converted','Lost','Not Reachable','On Hold') NOT NULL DEFAULT 'New',
    lead_category ENUM('Fresh Lead','Bulk Lead','Cold Lead','Warm Lead','Hot Lead','Converted Lead','Lost Lead','Walk-in Lead','Re-Targeted Lead','Campaign Lead') NULL,
    name VARCHAR(255) NOT NULL,
    phone_no VARCHAR(20) NOT NULL,
    address TEXT NULL,
    assigned_to INT NULL,
    created_by INT NULL,
    admin_id INT NULL,
    manager_id INT NULL,
    campaign_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notes TEXT NULL,
    updated_by INT NULL,
    INDEX idx_leads_assigned_to (assigned_to),
    INDEX idx_leads_campaign_id (campaign_id),
    INDEX idx_leads_status (status),
    INDEX idx_leads_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`, (err) => {
    if (err) console.error("Lead table bootstrap failed:", err.message);
    else console.info("Lead table bootstrap checked/ready.");
    server.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));
});

// Lightweight health check for deployment platforms.
app.get("/health", (req, res) => {
    res.status(200).json({ success: true, status: "healthy" });
});

// Root Endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: process.env.NODE_ENV === 'production' ? "Welcome to the production API" : "Welcome to the development API",
        data: null
    });
});

// Start listening after the schema bootstrap callback.
const PORT = process.env.PORT || 5000;

// Error handling (Global)
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error for debugging
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        data: null
    });
});
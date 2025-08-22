// db.js
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

// Create a connection pool using Clever Cloud credentials
const db = mysql.createPool({
    host: process.env.DB_HOST,        // e.g., b4gnj8aucsevxum3koic-mysql.services.clever-cloud.com
    user: process.env.DB_USER,        // e.g., udlafrrqr0lp6fue
    password: process.env.DB_PASSWORD,// e.g., 1ofaMWhVwSPut6X8eJ1B
    database: process.env.DB_NAME,    // e.g., b4gnj8aucsevxum3koic
    port: process.env.DB_PORT,        // 3306
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 60000
});

// Function to test the connection (optional)
const testConnection = () => {
    db.getConnection((err, connection) => {
        if (err) {
            console.error('❌ Error connecting to Clever Cloud MySQL:', err);
            return;
        }
        console.log('✅ Successfully connected to Clever Cloud MySQL!');
        connection.release();
    });
};

// Automatically test on startup
testConnection();

// Handle unexpected errors and auto-reconnect
db.on('error', (err) => {
    console.error('⚠️ Database error:', err);

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Connection lost. Attempting to reconnect...');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Too many connections. Adjust pool size or wait.');
    }
    if (err.code === 'ECONNREFUSED') {
        console.error('Connection refused. Check credentials or Clever Cloud status.');
    }
});

module.exports = db;

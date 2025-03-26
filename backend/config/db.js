const mysql = require("mysql2");  // ✅ Use 'mysql2/promise'
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createPool({  // ✅ Use connection pool
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;  // ✅ No need for `.connect()`, Pool handles it

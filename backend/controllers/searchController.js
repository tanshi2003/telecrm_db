const db = require("../config/db");

exports.search = async (req, res) => {
  const { query, category, role } = req.query; // Include role in query parameters
  const authHeader = req.headers.authorization;

  // Debugging logs
  console.log("Query:", query);
  console.log("Category:", category);
  console.log("Role:", role);
  console.log("Authorization Header:", authHeader);

  if (!query || !category) {
    return res.status(400).json({ message: "Query and category are required." });
  }

  let sql = "";
  let params = [`%${query}%`, `%${query}%`];

  if (category === "users") {
    sql = `SELECT * FROM Users WHERE (name LIKE ? OR email LIKE ?)`;
    if (role) {
      sql += ` AND role = ?`; // Add role filter if provided
      params.push(role);
    }
  } else if (category === "campaigns") {
    sql = `SELECT * FROM Campaigns WHERE name LIKE ? OR description LIKE ?`;
  } else if (category === "leads") {
    sql = `SELECT * FROM Leads WHERE name LIKE ? OR phone_no LIKE ?`;
  } else {
    return res.status(400).json({ message: "Invalid category." });
  }

  try {
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Database Query Error:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      res.status(200).json({ results });
    });
  } catch (error) {
    console.error("Error in search controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getSuggestions = async (req, res) => {
  const { query, category } = req.query;

  if (!query || !category) {
    return res.status(400).json({ message: "Query and category are required." });
  }

  let sql = "";
  let params = [`%${query}%`];

  if (category === "users") {
    sql = `SELECT name, role FROM Users WHERE name LIKE ? LIMIT 5`;
  } else if (category === "campaigns") {
    sql = `SELECT name FROM Campaigns WHERE name LIKE ? LIMIT 5`;
  } else if (category === "leads") {
    sql = `SELECT name FROM Leads WHERE name LIKE ? LIMIT 5`;
  } else {
    return res.status(400).json({ message: "Invalid category." });
  }

  try {
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Database Query Error:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      res.status(200).json({ suggestions: results });
    });
  } catch (error) {
    console.error("Error in getSuggestions:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const responseFormatter = require("../utils/responseFormatter");

const createAdmin = async () => {
  try {
    console.log(responseFormatter(true, "🚀 Starting admin creation..."));

    const adminEmail = "tkhandelwal03@gmail.com";
    const adminName = "Tanshi";
    const adminPassword = "admin@123";
    const adminPhoneNo = "1234567890";
    const adminStatus = "active";
    const adminRole = "admin"; // Setting role as 'admin'
    const token = null;
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    console.log(responseFormatter(true, "🔍 Checking if admin exists..."));

    // Check if admin already exists
    const checkSql = "SELECT * FROM Admins WHERE email = ?";
    db.query(checkSql, [adminEmail], (err, results) => {
      if (err) {
        console.error(responseFormatter(false, "❌ Database error while checking admin:", err));
        return;
      }

      console.log(responseFormatter(true, "📊 Query executed, results:", results.length));

      if (results.length > 0) {
        console.log(responseFormatter(false, "❌ Admin already exists. No new admin added."));
        return;
      }

      console.log(responseFormatter(true, "📝 Inserting new admin..."));

      // Insert new admin
      const insertSql = "INSERT INTO Admins (name, email, password, phone_no, status, role, token) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(insertSql, [adminName, adminEmail, hashedPassword, adminPhoneNo, adminStatus, adminRole, token], (insertErr, result) => {
        if (insertErr) {
          console.error(responseFormatter(false, "❌ Error inserting admin:", insertErr));
        } else {
          console.log(responseFormatter(true, "✅ Admin created successfully!"));
        }
      });
    });
  } catch (error) {
    console.error(responseFormatter(false, "❌ Error in createAdmin function:", error));
  }
};

// Execute function
createAdmin();
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const createAdmin = async () => {
  try {
    console.log("🚀 Starting admin creation...");

    const adminEmail = "tkhandelwal03@gmail.com";
    const adminName = "Tanshi";
    const adminPassword = "admin@123";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    console.log("🔍 Checking if admin exists...");

    // Check if admin already exists
    const checkSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkSql, [adminEmail], (err, results) => {
      if (err) {
        console.error("❌ Database error while checking admin:", err);
        return;
      }

      console.log("📊 Query executed, results:", results.length);

      if (results.length > 0) {
        console.log("❌ Admin already exists. No new admin added.");
        return;
      }

      console.log("📝 Inserting new admin...");

      // Insert new admin
      const insertSql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
      db.query(insertSql, [adminName, adminEmail, hashedPassword, "admin"], (insertErr, result) => {
        if (insertErr) {
          console.error("❌ Error inserting admin:", insertErr);
        } else {
          console.log("✅ Admin created successfully!");
        }
      });
    });
  } catch (error) {
    console.error("❌ Error in createAdmin function:", error);
  }
};

// Execute function
createAdmin();

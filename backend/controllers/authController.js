const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM admin WHERE email = ? AND role = ?", [email, role]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = rows[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin.id, role: admin.role }, "your_secret_key", { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.login = async (req, res) => {
  res.json({ message: "Login successful!" });
};

const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    console.log('Login request received:', { email, role });

    const admin = await Admin.findOne({ where: { email, role } });
    if (!admin) {
      console.log('Admin not found');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: admin.id, role: admin.role }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email, role: 'admin' } });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Logic to send password reset email (e.g., using nodemailer)
    res.status(200).json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
};
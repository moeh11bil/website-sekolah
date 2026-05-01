const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { validate } = require('../middleware/validation');
const { authValidation } = require('../middleware/validationRules');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', protect, authorize('admin'), authValidation.register, validate, async (req, res) => {
  const { username, full_name, password, role } = req.body;

  try {
    const [existingUser] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute('INSERT INTO users (username, full_name, password, role) VALUES (?, ?, ?, ?)', [username, full_name, hashedPassword, role]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', authValidation.login, validate, async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await pool.execute('SELECT id, username, full_name, password, role FROM users WHERE username = ?', [username]);
    const user = users[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

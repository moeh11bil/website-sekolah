const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all users (Admin only)
router.get('/', protect, authorize(['admin']), async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, username, full_name, role FROM users');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new user (Admin only)
router.post('/', protect, authorize(['admin']), async (req, res) => {
  const { username, full_name, password, role } = req.body;

  if (!username || !full_name || !password || !role) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const [existingUser] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute('INSERT INTO users (username, full_name, password, role) VALUES (?, ?, ?, ?)', [username, full_name, hashedPassword, role]);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a user (Admin only)
router.put('/:id', protect, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { username, full_name, password, role } = req.body;

  try {
    let updateFields = [];
    let queryParams = [];

    if (username) {
      updateFields.push('username = ?');
      queryParams.push(username);
    }
    if (full_name) {
      updateFields.push('full_name = ?');
      queryParams.push(full_name);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      queryParams.push(hashedPassword);
    }
    if (role) {
      updateFields.push('role = ?');
      queryParams.push(role);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    queryParams.push(id);
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user (Admin only)
router.delete('/:id', protect, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

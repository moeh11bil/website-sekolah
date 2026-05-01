const express = require('express');
const { pool } = require('../config/db');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all categories (Public access)
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.execute('SELECT id, name, slug FROM categories');
    res.json(categories);
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new category (Admin only)
router.post('/', protect, authorize(['admin']), async (req, res) => {
  const { name, slug } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ message: 'Please enter name and slug' });
  }

  try {
    const [existingCategory] = await pool.execute('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existingCategory.length > 0) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }

    await pool.execute('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
    res.status(201).json({ message: 'Category created successfully' });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a category (Admin only)
router.put('/:id', protect, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { name, slug } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ message: 'Please enter name and slug' });
  }

  try {
    const [existingCategory] = await pool.execute('SELECT id FROM categories WHERE slug = ? AND id != ?', [slug, id]);
    if (existingCategory.length > 0) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }

    const [result] = await pool.execute('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [name, slug, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a category (Admin only)
router.delete('/:id', protect, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

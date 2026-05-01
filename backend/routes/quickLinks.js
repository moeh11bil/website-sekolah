const express = require('express');
const { pool } = require('../config/db');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public: Get all quick links
router.get('/', async (req, res) => {
  try {
    const [links] = await pool.execute('SELECT * FROM quick_links ORDER BY created_at ASC');
    res.json(links);
  } catch (error) {
    console.error('Get quick links error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Admin: Add new quick link
router.post('/', protect, authorize(['admin']), async (req, res) => {
  const { title, url, icon } = req.body;
  if (!title || !url) return res.status(400).json({ message: 'Title and URL are required' });

  try {
    const [result] = await pool.execute(
      'INSERT INTO quick_links (title, url, icon) VALUES (?, ?, ?)',
      [title, url, icon || 'link']
    );
    res.status(201).json({ id: result.insertId, title, url, icon });
  } catch (error) {
    console.error('Add quick link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update quick link
router.put('/:id', async (req, res) => {
  const { title, url, icon } = req.body;
  const { id } = req.params;
  
  if (!title || !url) return res.status(400).json({ message: 'Title and URL are required' });

  try {
    const [result] = await pool.execute(
      'UPDATE quick_links SET title = ?, url = ?, icon = ? WHERE id = ?',
      [title, url, icon || 'link', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Quick link not found' });
    }
    
    res.json({ id, title, url, icon });
  } catch (error) {
    console.error('Update quick link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete quick link
router.delete('/:id', protect, authorize(['admin']), async (req, res) => {
  try {
    await pool.execute('DELETE FROM quick_links WHERE id = ?', [req.params.id]);
    res.json({ message: 'Quick link deleted' });
  } catch (error) {
    console.error('Delete quick link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const { pool } = require('../../config/db');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

const VALID_THEMES = ['emerald', 'ocean', 'sunset'];

router.get('/', protect, authorize(['admin']), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT value FROM settings WHERE name = "site_theme" ORDER BY id DESC LIMIT 1'
    );
    res.json({ theme: rows[0]?.value || 'emerald' });
  } catch (error) {
    console.error('Get theme error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT value FROM settings WHERE name = "site_theme" ORDER BY id DESC LIMIT 1'
    );
    res.json({ theme: rows[0]?.value || 'emerald' });
  } catch (error) {
    console.error('Get public theme error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, authorize(['admin']), async (req, res) => {
  const { theme } = req.body;

  if (!theme) {
    return res.status(400).json({ message: 'Theme name is required' });
  }

  if (!VALID_THEMES.includes(theme)) {
    return res.status(400).json({ message: `Invalid theme. Valid themes: ${VALID_THEMES.join(', ')}` });
  }

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM settings WHERE name = "site_theme" ORDER BY id DESC LIMIT 1'
    );

    if (existing.length > 0) {
      await pool.execute('UPDATE settings SET value = ?, updated_at = NOW() WHERE id = ?', [theme, existing[0].id]);
    } else {
      await pool.execute(
        'INSERT INTO settings (name, value, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        ['site_theme', theme]
      );
    }
    res.json({ message: 'Theme updated successfully', theme });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/', protect, authorize(['admin']), async (req, res) => {
  try {
    await pool.execute('DELETE FROM settings WHERE name = "site_theme"');
    res.json({ message: 'Theme reset to default', theme: 'emerald' });
  } catch (error) {
    console.error('Reset theme error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
module.exports.VALID_THEMES = VALID_THEMES;

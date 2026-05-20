const express = require('express');
const { pool } = require('../../config/db');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { imageUpload, deleteOldImage, cleanupImage } = require('../../utils/imageUpload');

const router = express.Router();

router.get('/', protect, authorize(['admin']), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, school_name, school_moto, logo_url FROM school_info ORDER BY id DESC LIMIT 1'
    );
    res.json(rows[0] || { id: null, school_name: '', school_moto: '', logo_url: null });
  } catch (error) {
    console.error('Get school info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT school_name, school_moto, logo_url FROM school_info ORDER BY id DESC LIMIT 1'
    );
    res.json(rows[0] || { school_name: 'Sekolah Modern', school_moto: 'Pendidikan Masa Depan, Mulai dari Sini.', logo_url: null });
  } catch (error) {
    console.error('Get public school info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, authorize(['admin']), imageUpload({ subDir: 'pages', fieldName: 'logo', width: 300, quality: 90 }), async (req, res) => {
  if (!req.body) { cleanupImage(req.imageFilePath); return res.status(400).json({ message: 'Request body is required' }); }

  const { school_name, school_moto } = req.body;
  const logoUrl = req.imageUrl || null;
  const deleteLogo = req.body.delete_logo === 'true';

  if (!school_name || !school_moto) {
    cleanupImage(req.imageFilePath);
    return res.status(400).json({ message: 'School name and motto are required' });
  }

  try {
    const [existing] = await pool.execute('SELECT id, logo_url FROM school_info ORDER BY id DESC LIMIT 1');

    if (existing.length > 0) {
      if (deleteLogo) {
        deleteOldImage(existing[0].logo_url);
        await pool.execute(
          'UPDATE school_info SET school_name = ?, school_moto = ?, logo_url = NULL, updated_at = NOW() WHERE id = ?',
          [school_name, school_moto, existing[0].id]
        );
      } else if (logoUrl) {
        deleteOldImage(existing[0].logo_url);
        await pool.execute(
          'UPDATE school_info SET school_name = ?, school_moto = ?, logo_url = ?, updated_at = NOW() WHERE id = ?',
          [school_name, school_moto, logoUrl, existing[0].id]
        );
      } else {
        await pool.execute(
          'UPDATE school_info SET school_name = ?, school_moto = ?, updated_at = NOW() WHERE id = ?',
          [school_name, school_moto, existing[0].id]
        );
      }
    } else {
      if (logoUrl) {
        await pool.execute(
          'INSERT INTO school_info (school_name, school_moto, logo_url, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
          [school_name, school_moto, logoUrl]
        );
      } else {
        await pool.execute(
          'INSERT INTO school_info (school_name, school_moto, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
          [school_name, school_moto]
        );
      }
    }
    res.json({ message: 'School information saved successfully' });
  } catch (error) {
    console.error('Save school info error:', error);
    cleanupImage(req.imageFilePath);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, authorize(['admin']), imageUpload({ subDir: 'pages', fieldName: 'logo', width: 300, quality: 90 }), async (req, res) => {
  const { id } = req.params;
  const { school_name, school_moto } = req.body;
  const logoUrl = req.imageUrl || null;
  const deleteLogo = req.body.delete_logo === 'true';

  try {
    const [existing] = await pool.execute('SELECT id, logo_url FROM school_info WHERE id = ?', [id]);
    if (existing.length === 0) {
      cleanupImage(req.imageFilePath);
      return res.status(404).json({ message: 'School info not found' });
    }

    if (deleteLogo) {
      deleteOldImage(existing[0].logo_url);
      await pool.execute(
        'UPDATE school_info SET school_name = ?, school_moto = ?, logo_url = NULL, updated_at = NOW() WHERE id = ?',
        [school_name, school_moto, id]
      );
    } else if (logoUrl) {
      deleteOldImage(existing[0].logo_url);
      await pool.execute(
        'UPDATE school_info SET school_name = ?, school_moto = ?, logo_url = ?, updated_at = NOW() WHERE id = ?',
        [school_name, school_moto, logoUrl, id]
      );
    } else {
      await pool.execute(
        'UPDATE school_info SET school_name = ?, school_moto = ?, updated_at = NOW() WHERE id = ?',
        [school_name, school_moto, id]
      );
    }
    res.json({ message: 'School information updated successfully' });
  } catch (error) {
    console.error('Update school info error:', error);
    cleanupImage(req.imageFilePath);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.execute('SELECT logo_url FROM school_info WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'School info not found' });

    deleteOldImage(existing[0].logo_url);
    await pool.execute('DELETE FROM school_info WHERE id = ?', [id]);
    res.json({ message: 'School info deleted successfully' });
  } catch (error) {
    console.error('Delete school info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

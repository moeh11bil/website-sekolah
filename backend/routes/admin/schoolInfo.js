const express = require('express');
const { pool } = require('../../config/db');
const { protect, authorize } = require('../../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads/pages');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'));
  }
});

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

router.post('/', protect, authorize(['admin']), upload.single('logo'), async (req, res) => {
  if (!req.body) {
    cleanupFile(req.file);
    return res.status(400).json({ message: 'Request body is required' });
  }

  const { school_name, school_moto } = req.body;
  const logoUrl = req.file ? `/uploads/pages/${req.file.filename}` : null;
  const deleteLogo = req.body.delete_logo === 'true';

  if (!school_name || !school_moto) {
    cleanupFile(req.file);
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
    cleanupFile(req.file);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, authorize(['admin']), upload.single('logo'), async (req, res) => {
  const { id } = req.params;
  const { school_name, school_moto } = req.body;
  const logoUrl = req.file ? `/uploads/pages/${req.file.filename}` : null;
  const deleteLogo = req.body.delete_logo === 'true';

  try {
    const [existing] = await pool.execute('SELECT id, logo_url FROM school_info WHERE id = ?', [id]);
    if (existing.length === 0) {
      cleanupFile(req.file);
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
    cleanupFile(req.file);
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

function deleteOldImage(imagePath) {
  if (imagePath) {
    const fullPath = path.join(__dirname, '../../', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, (err) => { if (err) console.error('Error deleting old image:', err); });
    }
  }
}

function cleanupFile(file) {
  if (file) {
    fs.unlink(file.path, (err) => { if (err) console.error('Error cleaning up file:', err); });
  }
}

module.exports = router;

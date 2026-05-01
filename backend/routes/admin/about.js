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
      'SELECT id, sejarah, visi, misi, fasilitas, kontak, image_url FROM page_config WHERE page_type = "about" ORDER BY id DESC LIMIT 1'
    );
    res.json(rows[0] || { id: null, sejarah: '', visi: '', misi: '', fasilitas: '', kontak: '', image_url: null });
  } catch (error) {
    console.error('Get about config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT sejarah, visi, misi, fasilitas, kontak, image_url, status FROM page_config WHERE page_type = "about" AND status = "active" ORDER BY id DESC LIMIT 1'
    );
    res.json(rows[0] || { sejarah: '', visi: '', misi: '', fasilitas: '', kontak: '', image_url: null, status: 'active' });
  } catch (error) {
    console.error('Get public about config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, authorize(['admin']), upload.single('image'), async (req, res) => {
  if (!req.body) {
    cleanupFile(req.file);
    return res.status(400).json({ message: 'Request body is required' });
  }

  const { sejarah, visi, misi, fasilitas, kontak, status } = req.body;
  const imageUrl = req.file ? `/uploads/pages/${req.file.filename}` : null;

  if (!sejarah && !visi && !misi && !fasilitas && !kontak) {
    cleanupFile(req.file);
    return res.status(400).json({ message: 'At least one field is required' });
  }

  try {
    const [existing] = await pool.execute(
      'SELECT id, image_url FROM page_config WHERE page_type = "about" ORDER BY id DESC LIMIT 1'
    );

    if (existing.length > 0) {
      if (imageUrl) {
        deleteOldImage(existing[0].image_url);
        await pool.execute(
          'UPDATE page_config SET sejarah = ?, visi = ?, misi = ?, fasilitas = ?, kontak = ?, image_url = ?, title = "Tentang Kami", status = "active", updated_at = NOW() WHERE id = ?',
          [sejarah, visi, misi, fasilitas, kontak, imageUrl, existing[0].id]
        );
      } else {
        await pool.execute(
          'UPDATE page_config SET sejarah = ?, visi = ?, misi = ?, fasilitas = ?, kontak = ?, title = "Tentang Kami", status = "active", updated_at = NOW() WHERE id = ?',
          [sejarah, visi, misi, fasilitas, kontak, existing[0].id]
        );
      }
    } else {
      if (imageUrl) {
        await pool.execute(
          'INSERT INTO page_config (sejarah, visi, misi, fasilitas, kontak, image_url, title, page_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, "Tentang Kami", "about", "active", NOW(), NOW())',
          [sejarah, visi, misi, fasilitas, kontak, imageUrl]
        );
      } else {
        await pool.execute(
          'INSERT INTO page_config (sejarah, visi, misi, fasilitas, kontak, title, page_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, "Tentang Kami", "about", "active", NOW(), NOW())',
          [sejarah, visi, misi, fasilitas, kontak]
        );
      }
    }
    res.json({ message: 'About configuration saved successfully' });
  } catch (error) {
    console.error('Save about config error:', error);
    cleanupFile(req.file);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, authorize(['admin']), upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { sejarah, visi, misi, fasilitas, kontak, status } = req.body;
  const imageUrl = req.file ? `/uploads/pages/${req.file.filename}` : null;

  try {
    const [existing] = await pool.execute(
      'SELECT id, image_url FROM page_config WHERE page_type = "about" AND id = ?',
      [id]
    );

    if (existing.length === 0) {
      cleanupFile(req.file);
      return res.status(404).json({ message: 'About config not found' });
    }

    if (imageUrl) {
      deleteOldImage(existing[0].image_url);
      await pool.execute(
        'UPDATE page_config SET sejarah = ?, visi = ?, misi = ?, fasilitas = ?, kontak = ?, image_url = ?, title = "Tentang Kami", status = "active", updated_at = NOW() WHERE id = ?',
        [sejarah, visi, misi, fasilitas, kontak, imageUrl, id]
      );
    } else {
      await pool.execute(
        'UPDATE page_config SET sejarah = ?, visi = ?, misi = ?, fasilitas = ?, kontak = ?, title = "Tentang Kami", status = "active", updated_at = NOW() WHERE id = ?',
        [sejarah, visi, misi, fasilitas, kontak, id]
      );
    }
    res.json({ message: 'About configuration updated successfully' });
  } catch (error) {
    console.error('Update about config error:', error);
    cleanupFile(req.file);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.execute('SELECT image_url FROM page_config WHERE id = ? AND page_type = "about"', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'About not found' });

    deleteOldImage(existing[0].image_url);
    await pool.execute('DELETE FROM page_config WHERE id = ? AND page_type = "about"', [id]);
    res.json({ message: 'About deleted successfully' });
  } catch (error) {
    console.error('Delete about error:', error);
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

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

const handleUploadError = (err, req) => {
  if (err) {
    if (req.file) {
      fs.unlink(req.file.path, (e) => { if (e) console.error('Error deleting uploaded file:', e); });
    }
    return { error: err.message };
  }
  return null;
};

router.get('/', protect, authorize(['admin']), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, subtitle, image_url, cta_link, status, created_at, updated_at FROM page_config WHERE page_type = "header" ORDER BY id DESC LIMIT 1'
    );
    res.json(rows[0] || { id: null, title: '', subtitle: '', image_url: null, cta_link: '', status: 'active' });
  } catch (error) {
    console.error('Get header config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT title, subtitle, image_url, cta_link, status FROM page_config WHERE page_type = "header" AND status = "active" ORDER BY id DESC LIMIT 1'
    );
    res.json(rows[0] || {
      title: 'Pendidikan Masa Depan, Mulai dari Sini.',
      subtitle: 'Mencetak generasi unggul yang siap menghadapi tantangan global dengan pendekatan modern dan inovatif.',
      image_url: null,
      cta_link: '/register',
      status: 'active'
    });
  } catch (error) {
    console.error('Get public header config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, authorize(['admin']), upload.single('image'), async (req, res) => {
  const uploadError = handleUploadError(req.file?.validationError, req);
  if (uploadError) return res.status(400).json({ message: uploadError.error });
  if (!req.body) return res.status(400).json({ message: 'Request body is required' });

  const { title, subtitle, cta_link, status } = req.body;
  const imageUrl = req.file ? `/uploads/pages/${req.file.filename}` : null;

  try {
    const [existing] = await pool.execute(
      'SELECT id, image_url FROM page_config WHERE page_type = "header" ORDER BY id DESC LIMIT 1'
    );

    if (existing.length > 0) {
      let query, params;
      if (imageUrl) {
        query = 'UPDATE page_config SET title = ?, subtitle = ?, image_url = ?, cta_link = ?, status = ?, updated_at = NOW() WHERE id = ?';
        params = [title, subtitle, imageUrl, cta_link, status, existing[0].id];
        deleteOldImage(existing[0].image_url);
      } else {
        query = 'UPDATE page_config SET title = ?, subtitle = ?, cta_link = ?, status = ?, updated_at = NOW() WHERE id = ?';
        params = [title, subtitle, cta_link, status, existing[0].id];
      }
      await pool.execute(query, params);
    } else {
      await pool.execute(
        'INSERT INTO page_config (title, subtitle, image_url, cta_link, status, page_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, "header", NOW(), NOW())',
        [title, subtitle, imageUrl, cta_link, status]
      );
    }
    res.json({ message: 'Header configuration saved successfully' });
  } catch (error) {
    console.error('Save header config error:', error);
    cleanupFile(req.file);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, authorize(['admin']), upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, cta_link, status } = req.body;
  const imageUrl = req.file ? `/uploads/pages/${req.file.filename}` : null;

  try {
    const [existing] = await pool.execute(
      'SELECT id, image_url FROM page_config WHERE page_type = "header" AND id = ?',
      [id]
    );

    if (existing.length === 0) {
      cleanupFile(req.file);
      return res.status(404).json({ message: 'Header config not found' });
    }

    let query, params;
    if (imageUrl) {
      query = 'UPDATE page_config SET title = ?, subtitle = ?, image_url = ?, cta_link = ?, status = ?, updated_at = NOW() WHERE id = ?';
      params = [title, subtitle, imageUrl, cta_link, status, id];
      deleteOldImage(existing[0].image_url);
    } else {
      query = 'UPDATE page_config SET title = ?, subtitle = ?, cta_link = ?, status = ?, updated_at = NOW() WHERE id = ?';
      params = [title, subtitle, cta_link, status, id];
    }

    await pool.execute(query, params);
    res.json({ message: 'Header configuration updated successfully' });
  } catch (error) {
    console.error('Update header config error:', error);
    cleanupFile(req.file);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.execute('SELECT image_url FROM page_config WHERE id = ? AND page_type = "header"', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Header not found' });
    
    deleteOldImage(existing[0].image_url);
    await pool.execute('DELETE FROM page_config WHERE id = ? AND page_type = "header"', [id]);
    res.json({ message: 'Header deleted successfully' });
  } catch (error) {
    console.error('Delete header error:', error);
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

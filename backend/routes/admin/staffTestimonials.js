const express = require('express');
const { pool } = require('../../config/db');
const { protect, authorize } = require('../../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
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
      'SELECT * FROM staff_testimonials ORDER BY sort_order ASC, created_at ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get staff testimonials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, authorize(['admin']), upload.single('image'), async (req, res) => {
  const { name, position, quote, status, sort_order } = req.body;
  const imageUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;
  
  if (!name || !position || !quote) {
    cleanupFile(req.file);
    return res.status(400).json({ message: 'Nama, posisi, dan kutipan wajib diisi' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO staff_testimonials (name, position, quote, image_url, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [name, position, quote, imageUrl, status || 'active', sort_order || 0]
    );
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      position, 
      quote, 
      image_url: imageUrl, 
      status: status || 'active',
      sort_order: sort_order || 0
    });
  } catch (error) {
    console.error('Add staff testimonial error:', error);
    cleanupFile(req.file);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, authorize(['admin']), upload.single('image'), async (req, res) => {
  const { name, position, quote, status, sort_order } = req.body;
  const { id } = req.params;
  const imageUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;
  
  if (!name || !position || !quote) {
    cleanupFile(req.file);
    return res.status(400).json({ message: 'Nama, posisi, dan kutipan wajib diisi' });
  }

  try {
    const [existing] = await pool.execute('SELECT image_url FROM staff_testimonials WHERE id = ?', [id]);
    if (existing.length === 0) {
      cleanupFile(req.file);
      return res.status(404).json({ message: 'Testimoni tidak ditemukan' });
    }

    let query, params;
    if (imageUrl) {
      query = 'UPDATE staff_testimonials SET name = ?, position = ?, quote = ?, image_url = ?, status = ?, sort_order = ? WHERE id = ?';
      params = [name, position, quote, imageUrl, status || 'active', sort_order || 0, id];
      deleteOldImage(existing[0].image_url);
    } else {
      query = 'UPDATE staff_testimonials SET name = ?, position = ?, quote = ?, status = ?, sort_order = ? WHERE id = ?';
      params = [name, position, quote, status || 'active', sort_order || 0, id];
    }

    const [result] = await pool.execute(query, params);
    
    if (result.affectedRows === 0) {
      cleanupFile(req.file);
      return res.status(404).json({ message: 'Testimoni tidak ditemukan' });
    }
    
    res.json({ id, name, position, quote, image_url: imageUrl || existing[0].image_url, status: status || 'active', sort_order: sort_order || 0 });
  } catch (error) {
    console.error('Update staff testimonial error:', error);
    console.error('Error details:', error.message, error.stack);
    cleanupFile(req.file);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.delete('/:id', protect, authorize(['admin']), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT image_url FROM staff_testimonials WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Testimoni tidak ditemukan' });
    }

    const [result] = await pool.execute('DELETE FROM staff_testimonials WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Testimoni tidak ditemukan' });
    }

    deleteOldImage(rows[0].image_url);
    res.json({ message: 'Testimoni berhasil dihapus' });
  } catch (error) {
    console.error('Delete staff testimonial error:', error);
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

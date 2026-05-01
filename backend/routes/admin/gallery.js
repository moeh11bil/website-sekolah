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

router.get('/', protect, async (req, res) => {
  const { id: userId, role } = req.user;
  try {
    let query, params;
    if (role === 'admin') {
      query = 'SELECT * FROM gallery ORDER BY created_at DESC';
      params = [];
    } else {
      query = 'SELECT * FROM gallery WHERE created_by = ? ORDER BY created_at DESC';
      params = [userId];
    }
    const [items] = await pool.execute(query, params);
    res.json(items);
  } catch (error) {
    console.error('Get gallery items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const [items] = await pool.execute(
      'SELECT id, title, description, image_url, category, created_at FROM gallery WHERE status = "active" ORDER BY created_at DESC'
    );
    res.json(items);
  } catch (error) {
    console.error('Get public gallery items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, authorize(['admin', 'teacher', 'student']), upload.single('image'), async (req, res) => {
  if (!req.body) {
    cleanupFile(req.file);
    return res.status(400).json({ message: 'Request body is required' });
  }

  const { title, description, category, status } = req.body;
  const { id: userId, role } = req.user;
  const imageUrl = req.file ? `/uploads/pages/${req.file.filename}` : null;

  if (!title) {
    cleanupFile(req.file);
    return res.status(400).json({ message: 'Title is required' });
  }

  let defaultStatus = status || 'active';
  if (role === 'student') defaultStatus = 'inactive';
  else if (role === 'teacher' && !status) defaultStatus = 'active';

  try {
    const [result] = await pool.execute(
      'INSERT INTO gallery (title, description, created_by, image_url, category, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [title, description, userId, imageUrl, category, defaultStatus]
    );
    res.status(201).json({ message: 'Gallery item created successfully', id: result.insertId });
  } catch (error) {
    console.error('Create gallery item error:', error);
    cleanupFile(req.file);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;
  const { title, description, category, status } = req.body;
  const imageUrl = req.file ? `/uploads/pages/${req.file.filename}` : null;

  if (!title) {
    cleanupFile(req.file);
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const [galleryItem] = await pool.execute('SELECT created_by, status, image_url FROM gallery WHERE id = ?', [id]);
    if (galleryItem.length === 0) {
      cleanupFile(req.file);
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    if (role !== 'admin' && galleryItem[0].created_by !== userId) {
      cleanupFile(req.file);
      return res.status(403).json({ message: 'Not authorized to update this gallery item' });
    }

    let effectiveStatus = galleryItem[0].status;
    if (role === 'admin' && status) effectiveStatus = status;

    let query, params;
    if (imageUrl) {
      query = 'UPDATE gallery SET title = ?, description = ?, image_url = ?, category = ?, status = ?, updated_at = NOW() WHERE id = ?';
      params = [title, description, imageUrl, category, effectiveStatus, id];
      deleteOldImage(galleryItem[0].image_url);
    } else {
      query = 'UPDATE gallery SET title = ?, description = ?, category = ?, status = ?, updated_at = NOW() WHERE id = ?';
      params = [title, description, category, effectiveStatus, id];
    }

    const [result] = await pool.execute(query, params);
    if (result.affectedRows === 0) {
      cleanupFile(req.file);
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json({ message: 'Gallery item updated successfully' });
  } catch (error) {
    console.error('Update gallery item error:', error);
    cleanupFile(req.file);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  try {
    const [items] = await pool.execute('SELECT image_url, created_by FROM gallery WHERE id = ?', [id]);
    if (items.length === 0) return res.status(404).json({ message: 'Gallery item not found' });
    if (role !== 'admin' && items[0].created_by !== userId) return res.status(403).json({ message: 'Not authorized' });

    await pool.execute('DELETE FROM gallery WHERE id = ?', [id]);
    deleteOldImage(items[0].image_url);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/approve', protect, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute("UPDATE gallery SET status = 'active', updated_at = NOW() WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Gallery item not found' });
    res.json({ message: 'Gallery item approved successfully' });
  } catch (error) {
    console.error('Approve gallery item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/reject', protect, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute("UPDATE gallery SET status = 'inactive', updated_at = NOW() WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Gallery item not found' });
    res.json({ message: 'Gallery item rejected successfully' });
  } catch (error) {
    console.error('Reject gallery item error:', error);
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

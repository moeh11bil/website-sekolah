const express = require('express');
const { pool } = require('../../config/db');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { imageUpload, deleteOldImage, cleanupImage } = require('../../utils/imageUpload');

const router = express.Router();

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const offset = (page - 1) * limit;

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM gallery WHERE status = "active"'
    );
    const total = countResult[0].total;

    const [items] = await pool.execute(
      'SELECT id, title, description, image_url, category, created_at FROM gallery WHERE status = "active" ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Get public gallery items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, authorize(['admin', 'teacher', 'student']), imageUpload({ subDir: 'pages', width: 1200 }), async (req, res) => {
  if (!req.body) { cleanupImage(req.imageFilePath); return res.status(400).json({ message: 'Request body is required' }); }

  const { title, description, category, status } = req.body;
  const { id: userId, role } = req.user;
  const imageUrl = req.imageUrl || null;

  if (!title) {
    cleanupImage(req.imageFilePath);
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
    cleanupImage(req.imageFilePath);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, imageUpload({ subDir: 'pages', width: 1200 }), async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;
  const { title, description, category, status } = req.body;
  const imageUrl = req.imageUrl || null;

  if (!title) {
    cleanupImage(req.imageFilePath);
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const [galleryItem] = await pool.execute('SELECT created_by, status, image_url FROM gallery WHERE id = ?', [id]);
    if (galleryItem.length === 0) {
      cleanupImage(req.imageFilePath);
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    if (role !== 'admin' && galleryItem[0].created_by !== userId) {
      cleanupImage(req.imageFilePath);
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
      cleanupImage(req.imageFilePath);
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json({ message: 'Gallery item updated successfully' });
  } catch (error) {
    console.error('Update gallery item error:', error);
    cleanupImage(req.imageFilePath);
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

module.exports = router;

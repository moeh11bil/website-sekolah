const express = require('express');
const { pool } = require('../config/db');
const { protect, optionalAuth, authorize } = require('../middleware/authMiddleware');
const { imageUpload, deleteOldImage, cleanupImage } = require('../utils/imageUpload');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 9 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 9;
    const offset = (pageNum - 1) * limitNum;

    let countQuery = 'SELECT COUNT(*) as total FROM posts p JOIN users u ON p.author_id = u.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = \'published\'';
    let countParams = [];

    if (search && typeof search === 'string') {
      countQuery += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      countParams = [searchTerm, searchTerm];
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const totalPosts = countResult[0].total;
    const totalPages = Math.ceil(totalPosts / limitNum);

    let query = `SELECT p.id, p.title, LEFT(REGEXP_REPLACE(p.content, '<[^>]*>', ''), 200) AS content_snippet, p.status, p.created_at, p.published_at, u.full_name AS author, c.name AS category_name, p.image_url 
                 FROM posts p JOIN users u ON p.author_id = u.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = 'published'`;
    let params = [];

    if (search && typeof search === 'string') {
      query += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      params = [`%${search.trim()}%`, `%${search.trim()}%`];
    }

    query += ' ORDER BY p.published_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [posts] = await pool.execute(query, params);

    res.json({
      posts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalPosts,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        nextPage: pageNum < totalPages ? pageNum + 1 : null,
        prevPage: pageNum > 1 ? pageNum - 1 : null,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Get published posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-posts', protect, async (req, res) => {
  const { id: userId, role } = req.user;
  try {
    let query;
    let params;
    if (role === 'admin') {
      query = 'SELECT p.id, p.title, p.status, p.created_at, u.username AS author, p.image_url FROM posts p JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC';
      params = [];
    } else {
      query = 'SELECT p.id, p.title, p.status, p.created_at, p.image_url FROM posts p WHERE p.author_id = ? ORDER BY p.created_at DESC';
      params = [userId];
    }
    const [posts] = await pool.execute(query, params);
    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user || {};

  try {
    let [posts] = await pool.execute(
      'SELECT p.id, p.title, p.content, p.status, p.created_at, p.published_at, u.full_name AS author, p.category_id, c.name AS category_name, p.image_url ' +
      'FROM posts p JOIN users u ON p.author_id = u.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ? AND p.status = \'published\'',
      [id]
    );

    if (posts[0]) return res.json(posts[0]);

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required for this post' });
    }

    let query, params;
    if (role === 'admin') {
      query = 'SELECT p.id, p.title, p.content, p.status, p.created_at, p.published_at, u.full_name AS author, p.category_id, c.name AS category_name, p.image_url ' +
              'FROM posts p JOIN users u ON p.author_id = u.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?';
      params = [id];
    } else {
      query = 'SELECT p.id, p.title, p.content, p.status, p.created_at, p.published_at, u.full_name AS author, p.category_id, c.name AS category_name, p.image_url ' +
              'FROM posts p JOIN users u ON p.author_id = u.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ? AND p.author_id = ?';
      params = [id, userId];
    }

    [posts] = await pool.execute(query, params);
    if (!posts[0]) return res.status(404).json({ message: 'Post not found' });
    res.json(posts[0]);
  } catch (error) {
    console.error('Get single post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/upload-image', protect, imageUpload({ subDir: 'posts', width: 1200 }), async (req, res) => {
  if (!req.imageUrl) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  res.json({ url: req.imageUrl });
});

router.post('/', protect, authorize(['teacher', 'student', 'admin']), imageUpload({ subDir: 'posts', width: 1200 }), async (req, res) => {
  const { title, content, category_id, status: requestedStatus } = req.body;
  const { id: author_id, role } = req.user;
  const imageUrl = req.imageUrl || null;

  if (!title || !content) {
    cleanupImage(req.imageFilePath);
    return res.status(400).json({ message: 'Title and content are required' });
  }

  let status = 'pending_approval';
  let published_at = null;

  if (requestedStatus === 'draft') {
    status = 'draft';
  } else if ((role === 'teacher' || role === 'admin') && requestedStatus === 'published') {
    status = 'published';
    published_at = new Date();
  } else if (role === 'admin' && requestedStatus) {
    status = requestedStatus;
    if (status === 'published') published_at = new Date();
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO posts (title, content, author_id, category_id, status, published_at, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, content, author_id, category_id || null, status, published_at, imageUrl]
    );
    res.status(201).json({ message: 'Post created successfully', postId: result.insertId, status, imageUrl });
  } catch (error) {
    console.error('Create post error:', error);
    cleanupImage(req.imageFilePath);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, authorize(['teacher', 'student', 'admin']), imageUpload({ subDir: 'posts', width: 1200 }), async (req, res) => {
  const { title, content, category_id, status, remove_image } = req.body;
  const { id: userId, role } = req.user;
  const { id } = req.params;
  const imageUrl = req.imageUrl || null;
  const shouldRemoveImage = remove_image === 'true';

  try {
    const [postData] = await pool.execute('SELECT author_id, image_url, status FROM posts WHERE id = ?', [id]);
    const post = postData[0];

    if (!post) {
      cleanupImage(req.imageFilePath);
      return res.status(404).json({ message: 'Post not found' });
    }

    if (role !== 'admin' && post.author_id !== userId) {
      cleanupImage(req.imageFilePath);
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    let updateFields = [];
    let queryParams = [];

    if (title) { updateFields.push('title = ?'); queryParams.push(title); }
    if (content) { updateFields.push('content = ?'); queryParams.push(content); }
    if (category_id !== undefined && category_id !== '') { updateFields.push('category_id = ?'); queryParams.push(category_id); }
    else if (category_id === '') { updateFields.push('category_id = ?'); queryParams.push(null); }
    if (imageUrl) { updateFields.push('image_url = ?'); queryParams.push(imageUrl); }
    else if (shouldRemoveImage) {
      updateFields.push('image_url = ?');
      queryParams.push(null);
    }

    if (status && role === 'admin') {
      updateFields.push('status = ?');
      queryParams.push(status);
      updateFields.push('published_at = ?');
      queryParams.push(status === 'published' ? new Date() : null);
    } else if (status && post.author_id === userId) {
      if (role === 'teacher' && status === 'published') {
        updateFields.push('status = ?', 'published_at = ?');
        queryParams.push(status, new Date());
      } else if ((role === 'student' && status === 'pending_approval') || status === 'draft') {
        updateFields.push('status = ?', 'published_at = ?');
        queryParams.push(status, null);
      }
    }

    if (updateFields.length === 0) {
      cleanupImage(req.imageFilePath);
      return res.status(400).json({ message: 'No fields to update' });
    }

    queryParams.push(id);
    const [result] = await pool.execute(`UPDATE posts SET ${updateFields.join(', ')} WHERE id = ?`, queryParams);

    if (result.affectedRows === 0) {
      cleanupImage(req.imageFilePath);
      return res.status(404).json({ message: 'Post not found' });
    }

    if (imageUrl) deleteOldImage(post.image_url);
    else if (shouldRemoveImage && post.image_url) deleteOldImage(post.image_url);
    res.json({ message: 'Post updated successfully', imageUrl: shouldRemoveImage ? null : (imageUrl || post.image_url) });
  } catch (error) {
    console.error('Update post error:', error);
    cleanupImage(req.imageFilePath);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/approve', protect, authorize(['admin', 'teacher']), async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute(
      "UPDATE posts SET status = 'published', published_at = ? WHERE id = ? AND status = 'pending_approval'",
      [new Date(), id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Post not found or already published' });
    res.json({ message: 'Post approved and published successfully' });
  } catch (error) {
    console.error('Approve post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  try {
    const [postData] = await pool.execute('SELECT author_id, image_url FROM posts WHERE id = ?', [id]);
    const post = postData[0];

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (role !== 'admin' && post.author_id !== userId) return res.status(403).json({ message: 'Not authorized' });

    await pool.execute('DELETE FROM posts WHERE id = ?', [id]);

    if (post.image_url) deleteOldImage(post.image_url);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

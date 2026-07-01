const express = require('express');
const { pool } = require('../../config/db');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { imageUpload, deleteOldImage, cleanupImage } = require('../../utils/imageUpload');

const router = express.Router();

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

router.post('/', protect, authorize(['admin']), imageUpload({ subDir: 'pages', width: 1200 }), async (req, res) => {
  if (!req.body) { cleanupImage(req.imageFilePath); return res.status(400).json({ message: 'Request body is required' }); }

  const { sejarah, visi, misi, fasilitas, kontak, status } = req.body;
  const imageUrl = req.imageUrl || null;

  if (!sejarah && !visi && !misi && !fasilitas && !kontak) {
    cleanupImage(req.imageFilePath);
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
          'UPDATE page_config SET sejarah = ?, visi = ?, misi = ?, fasilitas = ?, kontak = ?, image_url = ?, title = "Tentang Kami", status = ?, updated_at = NOW() WHERE id = ?',
          [sejarah, visi, misi, fasilitas, kontak, imageUrl, status || 'active', existing[0].id]
        );
      } else {
        await pool.execute(
          'UPDATE page_config SET sejarah = ?, visi = ?, misi = ?, fasilitas = ?, kontak = ?, title = "Tentang Kami", status = ?, updated_at = NOW() WHERE id = ?',
          [sejarah, visi, misi, fasilitas, kontak, status || 'active', existing[0].id]
        );
      }
    } else {
      if (imageUrl) {
        await pool.execute(
          'INSERT INTO page_config (sejarah, visi, misi, fasilitas, kontak, image_url, title, page_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, "Tentang Kami", "about", ?, NOW(), NOW())',
          [sejarah, visi, misi, fasilitas, kontak, imageUrl, status || 'active']
        );
      } else {
        await pool.execute(
          'INSERT INTO page_config (sejarah, visi, misi, fasilitas, kontak, title, page_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, "Tentang Kami", "about", ?, NOW(), NOW())',
          [sejarah, visi, misi, fasilitas, kontak, status || 'active']
        );
      }
    }
    res.json({ message: 'About configuration saved successfully' });
  } catch (error) {
    console.error('Save about config error:', error);
    cleanupImage(req.imageFilePath);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, authorize(['admin']), imageUpload({ subDir: 'pages', width: 1200 }), async (req, res) => {
  const { id } = req.params;
  const { sejarah, visi, misi, fasilitas, kontak, status } = req.body;
  const imageUrl = req.imageUrl || null;

  try {
    const [existing] = await pool.execute(
      'SELECT id, image_url FROM page_config WHERE page_type = "about" AND id = ?',
      [id]
    );

    if (existing.length === 0) {
      cleanupImage(req.imageFilePath);
      return res.status(404).json({ message: 'About config not found' });
    }

    if (imageUrl) {
      deleteOldImage(existing[0].image_url);
      await pool.execute(
        'UPDATE page_config SET sejarah = ?, visi = ?, misi = ?, fasilitas = ?, kontak = ?, image_url = ?, title = "Tentang Kami", status = ?, updated_at = NOW() WHERE id = ?',
        [sejarah, visi, misi, fasilitas, kontak, imageUrl, status || 'active', id]
      );
    } else {
      await pool.execute(
        'UPDATE page_config SET sejarah = ?, visi = ?, misi = ?, fasilitas = ?, kontak = ?, title = "Tentang Kami", status = ?, updated_at = NOW() WHERE id = ?',
        [sejarah, visi, misi, fasilitas, kontak, status || 'active', id]
      );
    }
    res.json({ message: 'About configuration updated successfully' });
  } catch (error) {
    console.error('Update about config error:', error);
    cleanupImage(req.imageFilePath);
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

module.exports = router;

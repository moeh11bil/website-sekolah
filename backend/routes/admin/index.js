const express = require('express');
const router = express.Router();

console.log('=== ADMIN INDEX.JS LOADED ===');

const headerRoutes = require('./header');
const aboutRoutes = require('./about');
const galleryRoutes = require('./gallery');
const schoolInfoRoutes = require('./schoolInfo');
const themeRoutes = require('./theme');
const staffTestimonialsRoutes = require('./staffTestimonials');

router.use('/header', headerRoutes);
router.use('/about', aboutRoutes);
router.use('/gallery', galleryRoutes);
router.use('/school-info', schoolInfoRoutes);
router.use('/theme', themeRoutes);
router.use('/staff-testimonials', staffTestimonialsRoutes);

router.get('/public/header', async (req, res) => {
  const { pool } = require('../../config/db');
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
    console.error('Get public header error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/public/about', async (req, res) => {
  const { pool } = require('../../config/db');
  try {
    const [rows] = await pool.execute(
      'SELECT sejarah, visi, misi, fasilitas, kontak, image_url, status FROM page_config WHERE page_type = "about" AND status = "active" ORDER BY id DESC LIMIT 1'
    );
    res.json(rows[0] || { sejarah: '', visi: '', misi: '', fasilitas: '', kontak: '', image_url: null, status: 'active' });
  } catch (error) {
    console.error('Get public about error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/public/gallery', async (req, res) => {
  console.log('=== PUBLIC GALLERY HANDLER CALLED ===');
  const { pool } = require('../../config/db');
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

    console.log('Gallery items found:', items.length, 'total:', total);
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
    console.error('Get public gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/public/school-info', async (req, res) => {
  const { pool } = require('../../config/db');
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

router.get('/public/theme', async (req, res) => {
  const { pool } = require('../../config/db');
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

router.get('/public/staff-testimonials', async (req, res) => {
  const { pool } = require('../../config/db');
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, position, quote, image_url FROM staff_testimonials WHERE status = "active" ORDER BY sort_order ASC, created_at ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get public staff testimonials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

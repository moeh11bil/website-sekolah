const express = require('express');
const rateLimit = require('express-rate-limit');
const { pool } = require('../config/db');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

const MAX_PATH_LENGTH = 255;
const MIN_VISITOR_ID_LENGTH = 8;
const MAX_VISITOR_ID_LENGTH = 64;
const DAILY_CHART_DAYS = 14;

// Batasi frekuensi /track per IP agar data tidak bisa di-spam tak terbatas
const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

// Lazy migration: buat tabel page_views saat pertama kali dibutuhkan
let tableReadyPromise = null;
function ensureTable() {
  if (!tableReadyPromise) {
    tableReadyPromise = pool
      .execute(
        `CREATE TABLE IF NOT EXISTS page_views (
          id INT AUTO_INCREMENT PRIMARY KEY,
          path VARCHAR(255) NOT NULL,
          visitor_id VARCHAR(64) NOT NULL,
          viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_viewed_at (viewed_at),
          INDEX idx_path_viewed_at (path, viewed_at)
        ) ENGINE=InnoDB`
      )
      .catch(err => {
        tableReadyPromise = null; // coba lagi pada request berikutnya
        throw err;
      });
  }
  return tableReadyPromise;
}

function isValidVisitorId(value) {
  return (
    typeof value === 'string' &&
    value.length >= MIN_VISITOR_ID_LENGTH &&
    value.length <= MAX_VISITOR_ID_LENGTH
  );
}

function looksLikeBot(userAgent) {
  return /bot|crawler|spider|slurp|curl|wget|python-requests|headless/i.test(userAgent || '');
}

// Hanya izinkan path rapi (huruf/angka/-_/.) tanpa query/hash/char aneh,
// agar data yang masuk tidak bisa dikotori input sewenang-wenang
function sanitizePath(rawPath) {
  if (typeof rawPath !== 'string') return null;
  const clean = rawPath.split('?')[0].split('#')[0].slice(0, MAX_PATH_LENGTH);
  if (!/^\/[A-Za-z0-9\-_/.~]*$/.test(clean) || clean.includes('..')) return null;
  return clean;
}

// POST /api/analytics/track - catat satu kunjungan halaman (public)
router.post('/track', trackLimiter, async (req, res) => {
  try {
    const { path, visitorId } = req.body || {};

    const cleanPath = sanitizePath(path);
    if (!cleanPath) {
      return res.status(400).json({ message: 'Invalid path' });
    }
    if (!isValidVisitorId(visitorId)) {
      return res.status(400).json({ message: 'Invalid visitor id' });
    }
    if (looksLikeBot(req.headers['user-agent'])) {
      return res.json({ tracked: false, reason: 'bot' });
    }

    await ensureTable();
    await pool.execute('INSERT INTO page_views (path, visitor_id) VALUES (?, ?)', [
      cleanPath,
      visitorId
    ]);
    res.json({ tracked: true });
  } catch (error) {
    console.error('Track pageview error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/summary - ringkasan untuk footer publik (tanpa auth)
router.get('/summary', async (req, res) => {
  try {
    await ensureTable();

    const [totalRows] = await pool.execute(
      'SELECT COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS uniqueVisitors FROM page_views'
    );
    const [todayRows] = await pool.execute(
      `SELECT COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS uniqueVisitors
       FROM page_views WHERE viewed_at >= CURDATE()`
    );

    res.json({
      totalViews: Number(totalRows[0].views) || 0,
      totalUniqueVisitors: Number(totalRows[0].uniqueVisitors) || 0,
      viewsToday: Number(todayRows[0].views) || 0,
      uniqueVisitorsToday: Number(todayRows[0].uniqueVisitors) || 0
    });
  } catch (error) {
    console.error('Analytics summary error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/analytics/reset - hapus seluruh data statistik (admin only)
router.post('/reset', protect, authorize(['admin']), async (req, res) => {
  try {
    await ensureTable();
    const [result] = await pool.execute('DELETE FROM page_views');
    res.json({ reset: true, deletedRows: result.affectedRows || 0 });
  } catch (error) {
    console.error('Analytics reset error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/stats - statistik lengkap untuk dashboard admin
router.get('/stats', protect, authorize(['admin']), async (req, res) => {
  try {
    await ensureTable();

    const [totalRows] = await pool.execute(
      'SELECT COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS uniqueVisitors FROM page_views'
    );
    const [todayRows] = await pool.execute(
      `SELECT COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS uniqueVisitors
       FROM page_views WHERE viewed_at >= CURDATE()`
    );

    const [dailyRows] = await pool.execute(
      `SELECT DATE(viewed_at) AS date,
              COUNT(*) AS views,
              COUNT(DISTINCT visitor_id) AS uniqueVisitors
       FROM page_views
       WHERE viewed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(viewed_at)
       ORDER BY date ASC`,
      [DAILY_CHART_DAYS - 1]
    );

    const [pageRows] = await pool.execute(
      `SELECT path,
              COUNT(*) AS views,
              COUNT(DISTINCT visitor_id) AS uniqueVisitors,
              MAX(viewed_at) AS lastViewedAt
       FROM page_views
       GROUP BY path
       ORDER BY views DESC
       LIMIT 200`
    );

    res.json({
      totals: {
        views: Number(totalRows[0].views) || 0,
        uniqueVisitors: Number(totalRows[0].uniqueVisitors) || 0
      },
      today: {
        views: Number(todayRows[0].views) || 0,
        uniqueVisitors: Number(todayRows[0].uniqueVisitors) || 0
      },
      daily: dailyRows.map(row => ({
        date: row.date,
        views: Number(row.views) || 0,
        uniqueVisitors: Number(row.uniqueVisitors) || 0
      })),
      pages: pageRows.map(row => ({
        path: row.path,
        views: Number(row.views) || 0,
        uniqueVisitors: Number(row.uniqueVisitors) || 0,
        lastViewedAt: row.lastViewedAt
      }))
    });
  } catch (error) {
    console.error('Analytics stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

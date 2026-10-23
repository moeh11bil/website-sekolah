const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Verifikasi token lalu muat data user TERKINI dari database.
// Mengembalikan payload user (dengan role segar dari DB) atau null bila
// token tidak valid / akun sudah dihapus. Melempar error bila DB bermasalah.
async function loadUserFromToken(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || decoded.id === undefined || decoded.id === null) {
    return null;
  }
  const [rows] = await pool.execute('SELECT id, role FROM users WHERE id = ?', [decoded.id]);
  if (!rows.length) {
    return null; // akun sudah dihapus - token lama tidak boleh berlaku lagi
  }
  // Role diambil dari DB (bukan dari token) agar pencopotan hak berlaku seketika
  return { ...decoded, role: rows[0].role };
}

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const user = await loadUserFromToken(token);
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, account no longer exists' });
      }
      req.user = user;
      return next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
      // Gagal cek ke database: hentikan akses (fail-closed), jangan percaya token lama
      console.error('Auth database check failed:', error.message);
      return res.status(503).json({ message: 'Service unavailable, please try again later' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const optionalAuth = async (req, res, next) => {
  req.user = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Sama seperti protect: role & keberadaan akun diverifikasi ke DB,
      // bila gagal dianggap anonim (tanpa hak istimewa)
      req.user = await loadUserFromToken(req.headers.authorization.split(' ')[1]);
    } catch (error) {
      req.user = null;
    }
  }
  next();
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return (req, res, next) => {
    if (!req.user || (roles.length > 0 && !roles.includes(req.user.role))) {
      return res.status(403).json({ message: 'User role not authorized to access this route' });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };

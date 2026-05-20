require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const postRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');
const quickLinksRoutes = require('./routes/quickLinks');
const { listRoutes } = require('./utils/route-debug');

// ... (other requires)

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const DOMAIN = process.env.DOMAIN || 'localhost';

// 1. Middleware Paling Awal: Paksa Header CORP
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// 2. Konfigurasi Helmet (Matikan fitur CORP bawaan agar tidak konflik)
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      FRONTEND_URL,
      `https://${DOMAIN}`,
      `http://${DOMAIN}`,
      'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173',
      `https://api.${DOMAIN}`,
      `http://api.${DOMAIN}`
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => NODE_ENV !== 'production'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => NODE_ENV !== 'production'
});

app.use(cors(corsOptions));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Static Files Middleware (Dengan header yang sangat longgar + cache)
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(uploadsDir, {
  maxAge: '7d',
  immutable: true,
  setHeaders: (res, filePath) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    }
  }
}));

if (NODE_ENV === 'production') {
  app.use('/api', limiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
}

connectDB().catch(err => {
  console.error('Database connection failed, but server starting anyway for development:', err.message);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);

// Public gallery route (diluar admin router untuk hindari Express 5 subrouter bug)
app.get('/api/admin/public/gallery', async (req, res) => {
  const pool = (require('./config/db')).pool;
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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total }
    });
  } catch (error) {
    console.error('Get public gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.use('/api/admin', adminRoutes);
app.use('/api/quick-links', quickLinksRoutes);
app.use('/api/update', updateRoutes);

app.get('/api/routes', (req, res) => {
  res.json(listRoutes(app));
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    domain: DOMAIN
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend server is running.',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      categories: '/api/categories',
      posts: '/api/posts',
      admin: '/api/admin'
    }
  });
});

// Serve frontend static files
const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuild));

// SPA fallback: serve index.html for any non-API, non-upload GET route
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

// DEBUG: test route at the very end
app.get('/api/git-test', (req, res) => {
  res.json({ success: true, message: 'git-test works!' });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log('INDEX: server started on port', PORT);
});

module.exports = app;

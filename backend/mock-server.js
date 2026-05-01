// Mock server for testing CORS configuration
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite default port
    'http://127.0.0.1:5173',  // Alternative localhost format
    'http://localhost:5174',  // Alternative Vite port
    'http://127.0.0.1:5174',  // Alternative localhost format
    'http://localhost:4173',  // Vite build preview port
    'http://127.0.0.1:4173',  // Alternative localhost format
    'http://localhost',        // Production deployment
    'http://127.0.0.1'         // Alternative localhost format
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Mock API endpoints that were causing CORS issues
app.get('/api/admin/public/header', (req, res) => {
  res.json({
    title: 'Pendidikan Masa Depan, Mulai dari Sini.',
    subtitle: 'Mencetak generasi unggul yang siap menghadapi tantangan global dengan pendekatan modern dan inovatif.',
    image_url: null,
    cta_text: 'Pelajari Lebih Lanjut',
    cta_link: '/tentang-kami',
    status: 'active'
  });
});

app.get('/api/admin/public/theme', (req, res) => {
  res.json({ theme: 'emerald' });
});

app.get('/api/admin/public/about', (req, res) => {
  res.json({
    sejarah: '',
    visi: '',
    misi: '',
    fasilitas: '',
    kontak: '',
    image_url: null,
    status: 'active'
  });
});

app.get('/api/admin/public/school-info', (req, res) => {
  res.json({
    school_name: 'Sekolah Modern',
    school_moto: 'Pendidikan Masa Depan, Mulai dari Sini.',
    logo_url: null
  });
});

// Mock posts endpoint
app.get('/api/posts', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Mock data for posts
  const mockPosts = [
    {
      id: 1,
      title: 'Pengumuman Penting',
      content: 'Ini adalah contoh pengumuman penting dari sekolah.',
      author: 'Admin Sekolah',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Kegiatan Ekstrakurikuler',
      content: 'Berikut adalah jadwal kegiatan ekstrakurikuler minggu ini.',
      author: 'Wali Kelas',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  res.json({
    posts: mockPosts,
    pagination: {
      current_page: page,
      total_pages: 1,
      total_posts: mockPosts.length,
      per_page: limit
    }
  });
});

// Mock single post endpoint
app.get('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const mockPost = {
    id: id,
    title: `Post ${id} Title`,
    content: `This is the content for post ${id}.`,
    author: 'Admin Sekolah',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  res.json(mockPost);
});

// Mock categories endpoint
app.get('/api/categories', (req, res) => {
  const mockCategories = [
    { id: 1, name: 'Pengumuman', description: 'Pengumuman sekolah' },
    { id: 2, name: 'Kegiatan', description: 'Kegiatan sekolah' },
    { id: 3, name: 'Berita', description: 'Berita terbaru' }
  ];

  res.json(mockCategories);
});

// Mock gallery endpoint
app.get('/api/admin/public/gallery', (req, res) => {
  const mockGallery = [
    {
      id: 1,
      title: 'Kegiatan Belajar Mengajar',
      description: 'Foto kegiatan belajar mengajar di kelas',
      image_url: '/uploads/pages/gallery-1.jpg',
      category: 'kegiatan',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Upacara Bendera',
      description: 'Foto upacara bendera hari Senin',
      image_url: '/uploads/pages/gallery-2.jpg',
      category: 'kegiatan',
      created_at: new Date().toISOString()
    }
  ];

  res.json(mockGallery);
});

app.get('/', (req, res) => {
  res.send('Mock backend server is running for CORS testing.');
});

app.listen(PORT, () => {
});
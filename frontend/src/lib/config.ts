export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Sekolah Modern';
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

export const IS_PRODUCTION = import.meta.env.PROD || import.meta.env.NODE_ENV === 'production';

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout'
  },
  users: '/api/users',
  categories: '/api/categories',
  posts: '/api/posts',
  quickLinks: '/api/quick-links',
  admin: {
    header: '/api/admin/header',
    about: '/api/admin/about',
    gallery: '/api/admin/gallery',
    schoolInfo: '/api/admin/school-info',
    theme: '/api/admin/theme',
    staffTestimonials: '/api/admin/staff-testimonials'
  },
  public: {
    header: '/api/admin/public/header',
    about: '/api/admin/public/about',
    gallery: '/api/admin/public/gallery',
    schoolInfo: '/api/admin/public/school-info',
    theme: '/api/admin/public/theme',
    staffTestimonials: '/api/admin/public/staff-testimonials'
  }
};

export const getFullUrl = (endpoint: string) => {
  if (endpoint.startsWith('http')) return endpoint;
  return `${API_URL}${endpoint}`;
};

export const getImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  
  // Ensure we use the API_URL for all relative paths
  // If imagePath doesn't start with '/', add it
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_URL}${path}`;
};

export const formatLinkUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('/') || url.startsWith('#')) return url;
  return `https://${url}`;
};

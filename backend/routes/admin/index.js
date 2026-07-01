const express = require('express');
const router = express.Router();

const headerRoutes = require('./header');
const aboutRoutes = require('./about');
const galleryRoutes = require('./gallery');
const schoolInfoRoutes = require('./schoolInfo');
const themeRoutes = require('./theme');
const staffTestimonialsRoutes = require('./staffTestimonials');

// Subrouter mounts untuk admin CRUD
router.use('/header', headerRoutes);
router.use('/about', aboutRoutes);
router.use('/gallery', galleryRoutes);
router.use('/school-info', schoolInfoRoutes);
router.use('/theme', themeRoutes);
router.use('/staff-testimonials', staffTestimonialsRoutes);

module.exports = router;

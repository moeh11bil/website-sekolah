const { body, param, query } = require('express-validator');

const authValidation = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['admin', 'teacher', 'student'])
      .withMessage('Invalid role')
  ],
  login: [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]
};

const postValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title is required and must be less than 255 characters'),
    body('content')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Content is required'),
    body('category_id')
      .optional()
      .isInt()
      .withMessage('Category ID must be an integer'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'pending_approval'])
      .withMessage('Invalid status')
  ],
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be less than 255 characters'),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Content cannot be empty'),
    body('category_id')
      .optional({ nullable: true })
      .custom((value) => value === '' || (value && Number.isInteger(Number(value))))
      .withMessage('Category ID must be an integer or empty'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'pending_approval'])
      .withMessage('Invalid status')
  ],
  idParam: [
    param('id')
      .isInt()
      .withMessage('Post ID must be an integer')
  ]
};

const categoryValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Category name is required and must be less than 100 characters')
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Category name must be less than 100 characters')
  ]
};

const headerValidation = {
  save: [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Title must be less than 255 characters'),
    body('subtitle')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Subtitle must be less than 500 characters'),
    body('cta_link')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('CTA link must be less than 255 characters'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Invalid status')
  ]
};

const aboutValidation = {
  save: [
    body('sejarah')
      .optional()
      .trim(),
    body('visi')
      .optional()
      .trim(),
    body('misi')
      .optional()
      .trim(),
    body('fasilitas')
      .optional()
      .trim(),
    body('kontak')
      .optional()
      .trim(),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Invalid status')
  ]
};

const galleryValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title is required and must be less than 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Category must be less than 100 characters'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Invalid status')
  ],
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be less than 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Category must be less than 100 characters'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Invalid status')
  ]
};

const schoolInfoValidation = {
  save: [
    body('school_name')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('School name is required and must be less than 255 characters'),
    body('school_moto')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('School motto is required and must be less than 255 characters')
  ]
};

const themeValidation = {
  save: [
    body('theme')
      .trim()
      .isIn(['emerald', 'ocean', 'sunset'])
      .withMessage('Invalid theme. Valid themes: emerald, ocean, sunset')
  ]
};

module.exports = {
  authValidation,
  postValidation,
  categoryValidation,
  headerValidation,
  aboutValidation,
  galleryValidation,
  schoolInfoValidation,
  themeValidation
};

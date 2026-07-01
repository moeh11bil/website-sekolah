-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS sekolah_modern;

-- Use the newly created database
USE sekolah_modern;

-- Table for Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) DEFAULT '',
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE
);

-- Table for Posts (Blog Articles)
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL,
    category_id INT,
    status ENUM('draft', 'pending_approval', 'published') NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    image_url VARCHAR(255) NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Table for Page Configuration (Headers, About, etc.)
CREATE TABLE IF NOT EXISTS page_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_type ENUM('header', 'about', 'contact', 'footer') NOT NULL,
    title VARCHAR(255) DEFAULT NULL,
    subtitle TEXT,
    description TEXT,
    sejarah TEXT,
    visi TEXT,
    misi TEXT,
    fasilitas TEXT,
    kontak TEXT,
    image_url VARCHAR(255) NULL,
    cta_link VARCHAR(255) NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Gallery
CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INT,
    image_url VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table for School Information
CREATE TABLE IF NOT EXISTS school_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    school_moto TEXT NOT NULL,
    logo_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Settings
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Quick Links
CREATE TABLE IF NOT EXISTS quick_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(100) DEFAULT 'link',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO quick_links (title, url, icon) VALUES
('E-Learning', 'https://elearning.school.sch.id', 'graduation-cap'),
('Perpustakaan', 'https://library.school.sch.id', 'book'),
('Absensi', 'https://attendance.school.sch.id', 'clipboard-list')
ON DUPLICATE KEY UPDATE
url = VALUES(url),
icon = VALUES(icon);

-- Table for Staff Testimonials (Carousel)
CREATE TABLE IF NOT EXISTS staff_testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    quote TEXT NOT NULL,
    image_url VARCHAR(500) NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO staff_testimonials (name, position, quote, image_url, status, sort_order) VALUES
('Dr. Ahmad Wijaya, S.Pd., M.Pd.', 'Kepala Sekolah', 'Pendidikan adalah senjata paling ampuh untuk mengubah dunia. Mari kita bersama-sama mencetak generasi emas.', NULL, 'active', 1),
('Dra. Siti Nurhaliza', 'Waka Kurikulum', 'Setiap anak memiliki potensi luar biasa. Tugas kita adalah membantu mereka menemukan dan mengembangkan potensi tersebut.', NULL, 'active', 2),
('Budi Santoso, S.Si.', 'Guru Matematika', 'Matematika bukan tentang menghafal rumus, tapi tentang memahami logika dan berpikir kritis.', NULL, 'active', 3)
ON DUPLICATE KEY UPDATE
quote = VALUES(quote),
position = VALUES(position),
status = VALUES(status),
sort_order = VALUES(sort_order);

-- Optional: Add some default data
INSERT INTO users (username, password, role) VALUES
('admin', '$2b$10$e/PgvvJzq/YTsSSeA2mg1uQuAP2PCDgEOwz4IxLbEiVrX45R1WFfq', 'admin'),
('teacher1', '$2b$10$e/PgvvJzq/YTsSSeA2mg1uQuAP2PCDgEOwz4IxLbEiVrX45R1WFfq', 'teacher'),
('student1', '$2b$10$e/PgvvJzq/YTsSSeA2mg1uQuAP2PCDgEOwz4IxLbEiVrX45R1WFfq', 'student')
ON DUPLICATE KEY UPDATE
password = VALUES(password),
role = VALUES(role);

INSERT INTO categories (name, slug) VALUES
('Pengumuman', 'pengumuman'),
('Kegiatan Sekolah', 'kegiatan-sekolah'),
('Opini Siswa', 'opini-siswa')
ON DUPLICATE KEY UPDATE
slug = VALUES(slug);

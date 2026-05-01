const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateDatabase() {
  let connection;

  try {
    // Create connection without specifying database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });


    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);

    // Use the database
    await connection.query(`USE \`${process.env.DB_NAME}\`;`);

    // Create the users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin', 'teacher', 'student') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create the categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          slug VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    // Create the posts table (with LONGTEXT for content)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content LONGTEXT NOT NULL,
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
    `);

    // Create the page_config table (with all missing columns)
    await connection.query(`
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
          cta_text VARCHAR(255) NULL,
          cta_link VARCHAR(255) NULL,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Create the gallery table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          image_url VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Create the school_info table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS school_info (
          id INT AUTO_INCREMENT PRIMARY KEY,
          school_name VARCHAR(255) NOT NULL,
          school_moto TEXT NOT NULL,
          logo_url VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Create the settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          value TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Create the quick_links table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quick_links (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          url VARCHAR(500) NOT NULL,
          icon VARCHAR(100) DEFAULT 'link',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Create the staff_testimonials table
    await connection.query(`
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
    `);

    // Insert default users
    await connection.query(`
      INSERT INTO users (username, password, role) VALUES
      ('admin', '$2b$10$e/PgvvJzq/YTsSSeA2mg1uQuAP2PCDgEOwz4IxLbEiVrX45R1WFfq', 'admin'),
      ('teacher1', '$2b$10$e/PgvvJzq/YTsSSeA2mg1uQuAP2PCDgEOwz4IxLbEiVrX45R1WFfq', 'teacher'),
      ('student1', '$2b$10$e/PgvvJzq/YTsSSeA2mg1uQuAP2PCDgEOwz4IxLbEiVrX45R1WFfq', 'student')
      ON DUPLICATE KEY UPDATE
      password = VALUES(password),
      role = VALUES(role);
    `);

    // Insert default categories
    await connection.query(`
      INSERT INTO categories (name, slug) VALUES
      ('Pengumuman', 'pengumuman'),
      ('Kegiatan Sekolah', 'kegiatan-sekolah'),
      ('Opini Siswa', 'opini-siswa')
      ON DUPLICATE KEY UPDATE
      slug = VALUES(slug);
    `);

    // Insert default quick_links
    await connection.query(`
      INSERT INTO quick_links (title, url, icon) VALUES
      ('E-Learning', 'https://elearning.school.sch.id', 'graduation-cap'),
      ('Perpustakaan', 'https://library.school.sch.id', 'book'),
      ('Absensi', 'https://attendance.school.sch.id', 'clipboard-list')
      ON DUPLICATE KEY UPDATE
      url = VALUES(url),
      icon = VALUES(icon);
    `);

    // Insert default staff testimonials
    await connection.query(`
      INSERT INTO staff_testimonials (name, position, quote, image_url, status, sort_order) VALUES
      ('Dr. Ahmad Wijaya, S.Pd., M.Pd.', 'Kepala Sekolah', 'Pendidikan adalah senjata paling ampuh untuk mengubah dunia. Mari kita bersama-sama mencetak generasi emas.', NULL, 'active', 1),
      ('Dra. Siti Nurhaliza', 'Waka Kurikulum', 'Setiap anak memiliki potensi luar biasa. Tugas kita adalah membantu mereka menemukan dan mengembangkan potensi tersebut.', NULL, 'active', 2),
      ('Budi Santoso, S.Si.', 'Guru Matematika', 'Matematika bukan tentang menghafal rumus, tapi tentang memahami logika dan berpikir kritis.', NULL, 'active', 3)
      ON DUPLICATE KEY UPDATE
      quote = VALUES(quote),
      position = VALUES(position),
      status = VALUES(status),
      sort_order = VALUES(sort_order);
    `);

  } catch (error) {
    console.error('Error during migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration
migrateDatabase();

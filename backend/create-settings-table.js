const mysql = require('mysql2/promise');
require('dotenv').config();

async function createSettingsTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });


    // Create settings table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    await connection.execute(createTableQuery);

    // Check if theme setting exists, if not create it
    const [rows] = await connection.execute(
      'SELECT * FROM settings WHERE name = "site_theme"'
    );

    if (rows.length === 0) {
      // Insert default theme
      await connection.execute(
        'INSERT INTO settings (name, value) VALUES (?, ?)',
        ['site_theme', 'emerald']
      );
    } else {
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

createSettingsTable();
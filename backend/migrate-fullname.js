const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateFullName() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Connected to database. Adding full_name column...');

    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT '' AFTER username
    `);

    await connection.query(`
      UPDATE users SET full_name = username WHERE full_name = '' OR full_name IS NULL
    `);

    console.log('Migration completed: full_name column added.');

  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

migrateFullName();

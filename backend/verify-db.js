const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyDatabase() {
  let connection;

  try {
    // Connect to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });


    // Query to list all tables
    const [tables] = await connection.query('SHOW TABLES;');
    tables.forEach(table => {
    });

    // Verify each table exists and show its structure
    const expectedTables = ['users', 'categories', 'posts', 'page_config', 'gallery', 'settings'];
    
    for (const table of expectedTables) {
      const [result] = await connection.query(`DESCRIBE ${table};`);
      result.forEach(column => {
      });
    }

    // Count records in each table
    for (const table of expectedTables) {
      const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${table};`);
    }

  } catch (error) {
    console.error('Error during verification:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the verification
verifyDatabase();
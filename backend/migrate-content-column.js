const { pool, connectDB } = require('./config/db');

async function migrateContentColumn() {
  try {

    // Connect to the database
    await connectDB();

    // Change the content column from TEXT to LONGTEXT
    const alterQuery = `
      ALTER TABLE posts
      MODIFY COLUMN content LONGTEXT NOT NULL
    `;

    await pool.execute(alterQuery);


    // Close the connection
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateContentColumn();
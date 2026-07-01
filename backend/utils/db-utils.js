// db-utils.js - Database utility functions with error handling
const { pool } = require('../config/db');

// Wrapper function to handle database queries with error handling
async function dbQuery(query, params = []) {
  try {
    if (!pool) {
      throw new Error('Database connection not available');
    }
    return await pool.execute(query, params);
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

module.exports = { dbQuery };
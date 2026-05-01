#!/bin/bash
# Script to start the backend server in production mode (with database)

echo "Starting backend server in production mode..."

# Check if MySQL/MariaDB is running (works for both)
if mysqladmin ping 2>/dev/null || mariadb-admin ping 2>/dev/null; then
    echo "Database is running. Starting backend server..."
    cd /home/hilya/Aplikasi/website/backend
    node index.js
else
    echo "Database is not running."
    echo "To start MySQL: sudo systemctl start mysql"
    echo "To start MariaDB: sudo systemctl start mariadb"
    echo ""
    echo "Starting backend server anyway (will run without database)..."
    cd /home/hilya/Aplikasi/website/backend
    node index.js
fi
#!/bin/bash
# Script to start the backend server for development with mock server fallback

echo "Starting backend server for development..."

# Check if MySQL/MariaDB is running (works for both)
if mysqladmin ping 2>/dev/null || mariadb-admin ping 2>/dev/null; then
    echo "Database is running. Starting backend with database connection..."
    cd /home/hilya/Aplikasi/website/backend
    node index.js
else
    echo "Database is not running. Starting mock server for development..."
    echo "To start MySQL: sudo systemctl start mysql"
    echo "To start MariaDB: sudo systemctl start mariadb"
    echo ""
    echo "Starting mock server for development..."
    cd /home/hilya/Aplikasi/website/backend
    node mock-server.js
fi
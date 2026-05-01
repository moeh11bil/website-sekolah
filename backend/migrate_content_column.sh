#!/bin/bash

# Script to migrate the content column from TEXT to LONGTEXT
# This fixes the "Data too long for column 'content'" error

echo "Starting database migration to fix content column length..."

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "MySQL is not installed or not in PATH. Please install MySQL client."
    exit 1
fi

# Get database credentials from .env file
if [ -f "../.env" ]; then
    source ../.env
elif [ -f ".env" ]; then
    source .env
else
    echo "Error: .env file not found!"
    echo "Please ensure you have a .env file with DB credentials in the current or parent directory."
    echo "Required variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "Error: Database credentials not found in .env file!"
    echo "Required variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
    exit 1
fi

echo "Connecting to database: $DB_NAME on $DB_HOST as $DB_USER"

# Execute the migration
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << EOF
ALTER TABLE posts MODIFY COLUMN content LONGTEXT NOT NULL;
SELECT 'Migration completed successfully!' as Status;
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = '$DB_NAME' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'content';
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "Migration completed successfully!"
    echo "The content column has been changed from TEXT to LONGTEXT"
    echo "This allows storing up to 4GB of content per post"
    echo ""
    echo "Remember to restart your backend server to ensure all changes take effect."
else
    echo ""
    echo "Migration failed! Please check the database connection and credentials."
    exit 1
fi
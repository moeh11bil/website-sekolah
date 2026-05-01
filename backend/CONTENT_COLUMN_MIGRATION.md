# Database Migration: Fix Content Column Length Issue

## Problem
The `content` column in the `posts` table is defined as `TEXT`, which has a limit of 65,535 bytes. This causes the following error when inserting long content:

```
Error: Data too long for column 'content' at row 1
```

## Solution Options

### Option 1: Database Migration (Recommended)
Run the following SQL command to change the column type from `TEXT` to `LONGTEXT`:

```sql
ALTER TABLE posts MODIFY COLUMN content LONGTEXT NOT NULL;
```

This will increase the content capacity from ~64KB to ~4GB.

### Option 2: Application-Level Validation (Temporary Fix)
The application has been updated to validate content length and return an error if content exceeds 60,000 characters. This prevents the database error but limits content length.

## How to Apply the Recommended Solution

1. Connect to your MySQL database:
   ```bash
   mysql -u [username] -p [database_name]
   ```

2. Run the ALTER TABLE command:
   ```sql
   ALTER TABLE posts MODIFY COLUMN content LONGTEXT NOT NULL;
   ```

3. Exit the MySQL client:
   ```sql
   EXIT;
   ```

## Files Modified
- `/routes/posts.js` - Added content length validation to POST and PUT routes
- `/migration_sql_commands.txt` - Contains the SQL command for the recommended fix

## Notes
- The application-level validation provides immediate relief but the database migration is the proper long-term solution
- `LONGTEXT` can store up to 4,294,967,295 characters (~4GB)
- After applying the database migration, you can remove the content length validation from the application code if desired
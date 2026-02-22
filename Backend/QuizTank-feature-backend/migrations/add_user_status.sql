-- Add status column to users table
ALTER TABLE users ADD COLUMN status INTEGER DEFAULT 1;

-- Update existing users to have status 1
UPDATE users SET status = 1 WHERE status IS NULL;

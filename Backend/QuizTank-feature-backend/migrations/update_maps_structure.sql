-- Change status to integer
-- First drop the default
ALTER TABLE maps ALTER COLUMN status DROP DEFAULT;

-- Update existing values to be integers (as strings first to avoid cast error if safe cast not possible directly)
ALTER TABLE maps 
ALTER COLUMN status TYPE SMALLINT 
USING (CASE WHEN status = 'active' THEN 1 ELSE 2 END);

-- Set new default
ALTER TABLE maps ALTER COLUMN status SET DEFAULT 1;

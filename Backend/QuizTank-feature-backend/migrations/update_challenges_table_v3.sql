-- Migration to add status, type (int), and updated_at to challenges table
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS status INTEGER DEFAULT 1;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Since 'type' already exists as VARCHAR, we add 'type_id' or handle it cautiously
-- If the user wants 'type' to be INT, we would need to convert it, but to avoid breaking existing code
-- we will add a new column 'challenge_type' as an integer for now or just add status and updated_at.
-- However, following the request strictly:
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS type_id INTEGER DEFAULT 1;

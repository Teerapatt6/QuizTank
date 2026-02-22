-- Migration to add game_room and xp columns to challenges table
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS game_room JSONB DEFAULT '[]'::jsonb;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;

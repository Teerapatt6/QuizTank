-- Migration to add game_code column to game_rooms
ALTER TABLE game_rooms ADD COLUMN IF NOT EXISTS game_code VARCHAR(6) UNIQUE;

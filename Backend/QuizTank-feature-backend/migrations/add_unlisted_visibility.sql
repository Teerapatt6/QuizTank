-- Drop the existing check constraint and add a new one that includes visibility=4 (Unlisted)
ALTER TABLE game_rooms
DROP CONSTRAINT IF EXISTS game_rooms_visibility_check;

ALTER TABLE game_rooms
ADD CONSTRAINT game_rooms_visibility_check 
CHECK (visibility IN (1, 2, 3, 4));

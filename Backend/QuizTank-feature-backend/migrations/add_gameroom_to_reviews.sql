ALTER TABLE reviews
ADD COLUMN game_room_id INTEGER REFERENCES game_rooms(id) ON DELETE SET NULL;

CREATE INDEX idx_reviews_game_room ON reviews(game_room_id);

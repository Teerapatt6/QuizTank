CREATE TABLE IF NOT EXISTS game_favourites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    game_room_id INTEGER REFERENCES game_rooms(id),
    status INTEGER DEFAULT 1, -- 1=Active, 2=Inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_favourites_user_game ON game_favourites(user_id, game_room_id);

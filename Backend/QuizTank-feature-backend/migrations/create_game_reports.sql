CREATE TABLE IF NOT EXISTS game_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    game_room_id INTEGER REFERENCES game_rooms(id) ON DELETE CASCADE,
    reason TEXT,
    status INTEGER DEFAULT 1, -- 1=pending, 2=reviewed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

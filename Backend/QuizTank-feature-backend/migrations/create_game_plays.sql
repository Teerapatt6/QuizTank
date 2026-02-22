CREATE TABLE IF NOT EXISTS game_plays (
    id SERIAL PRIMARY KEY,
    game_room_id INTEGER REFERENCES game_rooms(id),
    user_id INTEGER REFERENCES users(user_id),
    status INTEGER DEFAULT 1 CHECK (status IN (1, 2, 3, 4)), -- 1=Playing, 2=Win, 3=Lost, 4=Canceled
    completion_time INTEGER, -- stores seconds taken or null
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

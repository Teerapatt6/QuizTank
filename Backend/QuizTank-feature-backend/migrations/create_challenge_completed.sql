CREATE TABLE IF NOT EXISTS challenge_completed (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    challenge_id INTEGER NOT NULL REFERENCES challenges(challenge_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_challenge_completed_user ON challenge_completed(user_id);
CREATE INDEX idx_challenge_completed_challenge ON challenge_completed(challenge_id);

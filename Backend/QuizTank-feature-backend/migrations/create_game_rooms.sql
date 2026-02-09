-- =====================================================
-- Game Rooms Table - Simplified single-table storage
-- =====================================================
-- This migration creates the game_rooms table that stores
-- all game data in one row with JSONB columns for complex data.
-- =====================================================

-- Create game_rooms table
CREATE TABLE IF NOT EXISTS game_rooms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    status INTEGER DEFAULT 2 CHECK (status IN (1, 2, 3)),  -- 1=Published, 2=Draft, 3=Removed
    visibility INTEGER DEFAULT 1 CHECK (visibility IN (1, 2, 3)),  -- 1=Public, 2=Private, 3=Locked
    password VARCHAR(255),  -- Required if visibility = 3 (Locked)
    
    -- Metadata
    category VARCHAR(100) DEFAULT '',
    language VARCHAR(50) DEFAULT 'English',
    tags JSONB DEFAULT '[]'::jsonb,
    description TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    
    -- Game Content (stored as JSONB)
    questions JSONB DEFAULT '[]'::jsonb,
    /*
    questions structure:
    [
        {
            "type": 1,  -- 1=Single, 2=Multiple, 3=Fill-in
            "question": "Question text",
            "media": ["url_1", "url_2"],
            "choices": [
                {"content": "Option A", "correct": 0},
                {"content": "Option B", "correct": 1}
            ],
            "answers": ["answer1", "answer2"]  -- For fill-in type
        }
    ]
    */
    
    knowledges JSONB DEFAULT '[]'::jsonb,
    /*
    knowledges structure:
    [
        {"content": "Some knowledge text"},
        {"content": "Another knowledge item"}
    ]
    */
    
    -- Gameplay Settings
    duration INTEGER DEFAULT 4,         -- Game duration in minutes
    enemies INTEGER DEFAULT 2,          -- Number of enemy tanks
    hearts INTEGER DEFAULT 3,           -- Number of hearts (lives)
    brains INTEGER DEFAULT 4,           -- Number of incorrect answers allowed
    initial_ammo INTEGER DEFAULT 50,    -- Starting ammo
    ammo_per_correct INTEGER DEFAULT 5, -- Ammo gained per correct answer
    map INTEGER DEFAULT 1,              -- Map ID
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game_rooms_user_id ON game_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_visibility ON game_rooms(visibility);
CREATE INDEX IF NOT EXISTS idx_game_rooms_category ON game_rooms(category);
CREATE INDEX IF NOT EXISTS idx_game_rooms_created_at ON game_rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_rooms_name_gin ON game_rooms USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_game_rooms_tags_gin ON game_rooms USING gin(tags);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_game_rooms_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_game_rooms_timestamp ON game_rooms;
CREATE TRIGGER trigger_update_game_rooms_timestamp
    BEFORE UPDATE ON game_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_game_rooms_timestamp();

-- =====================================================
-- Status reference:
-- 1 = Published (visible to others based on visibility)
-- 2 = Draft (only visible to creator)
-- 3 = Removed (soft delete)
-- 
-- Visibility reference:
-- 1 = Public (anyone can see and play)
-- 2 = Private (only creator can see)
-- 3 = Locked (requires password to play)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    biography TEXT,
    profile_pic_url TEXT,
    xp BIGINT DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) DEFAULT 'user',
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    status INTEGER DEFAULT 1,
    game_audio INTEGER DEFAULT 1,
    game_music NUMERIC DEFAULT 1.0,
    game_sfx NUMERIC DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS challenge_completed (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- FOREIGN KEY REFERENCES users(user_id),
    challenge_id INTEGER, -- FOREIGN KEY REFERENCES challenges(challenge_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS challenges (
    challenge_id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    difficulty VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    game_room JSONB,
    xp INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    type_id INTEGER,
    start_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS game_rooms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- FOREIGN KEY REFERENCES users(user_id),
    name VARCHAR(255),
    status INTEGER DEFAULT 1,
    visibility INTEGER DEFAULT 1,
    password VARCHAR(255),
    category VARCHAR(255),
    language VARCHAR(50),
    tags JSONB,
    description TEXT,
    cover_image TEXT,
    questions JSONB,
    knowledges JSONB,
    duration INTEGER,
    enemies INTEGER,
    hearts INTEGER,
    brains INTEGER,
    initial_ammo INTEGER,
    ammo_per_correct INTEGER,
    map INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ai_generated INTEGER DEFAULT 0,
    game_code VARCHAR(50) UNIQUE,
    questions_order INTEGER DEFAULT 1,
    knowledges_order INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS game_favourites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    game_room_id INTEGER,
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_plays (
    id SERIAL PRIMARY KEY,
    game_room_id INTEGER,
    user_id INTEGER,
    status INTEGER DEFAULT 1,
    completion_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    game_room_id INTEGER,
    reason TEXT,
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_unlocked (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    game_room_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maps (
    map_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    image_url TEXT,
    music_url TEXT,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data JSONB
);

CREATE TABLE IF NOT EXISTS options (
    key TEXT PRIMARY KEY,
    value JSONB
);

CREATE TABLE IF NOT EXISTS reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    rating INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    game_room_id INTEGER
);

CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    otp_code VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITHOUT TIME ZONE
);

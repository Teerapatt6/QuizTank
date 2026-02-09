const db = require('../config/db');

// --- SQL Constants (ใช้ซ้ำได้ ไม่ต้องเขียนใหม่หลายรอบ) ---
// ดึงข้อมูลครบ: เกม + ชื่อคนสร้าง + จำนวนข้อ + เรตติ้ง + จำนวนคนเล่น
const GAME_CARD_SELECT = `
    SELECT 
        g.game_id, 
        g.title, 
        g.description, 
        g.cover_image_url, 
        g.category, 
        g.difficulty, 
        g.is_ai_generated,
        g.play_count, -- ใช้ column นี้สำหรับ Sort ยอดฮิต (เร็วกว่านับสด)
        g.created_at,
        u.username as creator_name,
        u.profile_pic_url as creator_image,
        COUNT(DISTINCT q.question_id) as total_questions,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(DISTINCT uga.activity_id) as total_plays_counted -- อันนี้ไว้นับโชว์ (แต่อาจจะไม่ใช้ sort)
    FROM games g
    LEFT JOIN users u ON g.creator_id = u.user_id
    LEFT JOIN questions q ON g.game_id = q.game_id
    LEFT JOIN reviews r ON g.game_id = r.game_id
    LEFT JOIN user_game_activities uga ON g.game_id = uga.game_id
`;

// ต้อง Group By ตาม Primary Key ของตารางหลัก และ user
const GAME_CARD_GROUP = `GROUP BY g.game_id, u.user_id`;

// --- Helper to build dynamic WHERE clauses (Reduces code duplication) ---
// This helps ensure the Count query and Search query use the exact same filters
const buildSearchConditions = (filters, startParamIdx = 1) => {
    const params = [];
    let paramIdx = startParamIdx;
    let sql = ` WHERE g.visibility = 'public'`;

    // 1. Filter: Creator ID (New for Profile)
    if (filters.creatorId) {
        sql += ` AND g.creator_id = $${paramIdx}`;
        params.push(filters.creatorId);
        paramIdx++;
    }

    // 2. Filter: Keyword
    if (filters.term) {
        sql += ` AND (
            g.title ILIKE $${paramIdx} 
            OR g.description ILIKE $${paramIdx} 
            OR EXISTS (
                SELECT 1 FROM game_tags_rel gtr 
                JOIN tags t ON gtr.tag_id = t.tag_id 
                WHERE gtr.game_id = g.game_id AND t.name ILIKE $${paramIdx}
            )
        )`;
        params.push(`%${filters.term}%`);
        paramIdx++;
    }

    // 3. Filter: Category
    if (filters.category && filters.category !== 'all') {
        sql += ` AND g.category = $${paramIdx}`;
        params.push(filters.category);
        paramIdx++;
    }

    // 4. Filter: Difficulty
    if (filters.difficulty && filters.difficulty !== 'all') {
        sql += ` AND g.difficulty = $${paramIdx}`;
        params.push(filters.difficulty);
        paramIdx++;
    }

    return { sql, params, nextParamIdx: paramIdx };
};

module.exports = {
    // 1. ดึงเกมล่าสุด (Recent)
    getRecent: async (limit, offset) => {
        const sql = `
            ${GAME_CARD_SELECT}
            WHERE g.visibility = 'public'
            ${GAME_CARD_GROUP}
            ORDER BY g.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const { rows } = await db.query(sql, [limit, offset]);
        return rows;
    },

    // 2. เช็ค PIN (อันนี้ไม่ต้อง Join เยอะ เอาแค่ข้อมูลพื้นฐาน)
    findByPin: async (pin) => {
        const sql = `SELECT game_id, title, visibility FROM games WHERE game_id = $1`;

        // กัน error กรณี pin ไม่ใช่ตัวเลข
        if (isNaN(pin)) return null;

        const { rows } = await db.query(sql, [pin]);
        return rows[0];
    },

    // 3. ดึงเกมยอดฮิต (Trending) - ใช้ GAME_CARD_SELECT เพื่อให้ได้ข้อมูลครบ
    getTrending: async (limit, offset) => {
        const sql = `
            ${GAME_CARD_SELECT}
            WHERE g.visibility = 'public'
            ${GAME_CARD_GROUP}
            ORDER BY g.play_count DESC
            LIMIT $1 OFFSET $2
        `;
        const { rows } = await db.query(sql, [limit, offset]);
        return rows;
    },

    // 4. ดึงเกม AI ยอดนิยม (Popular AI)
    getPopularAi: async (limit, offset) => {
        const sql = `
            ${GAME_CARD_SELECT}
            WHERE g.visibility = 'public' 
              AND g.is_ai_generated = TRUE
            ${GAME_CARD_GROUP}
            ORDER BY g.play_count DESC
            LIMIT $1 OFFSET $2
        `;
        const { rows } = await db.query(sql, [limit, offset]);
        return rows;
    },

    getPublicProfileByUsername: async (username) => {
        const sql = `
            SELECT user_id, username, full_name, profile_pic_url, biography, level, xp 
            FROM users 
            WHERE username = $1
        `;
        const { rows } = await db.query(sql, [username]);
        return rows[0];
    },

    search: async (filters) => {
        // Use the helper to build the WHERE clause
        const { sql: whereClause, params, nextParamIdx } = buildSearchConditions(filters, 1);
        let paramIdx = nextParamIdx;

        // Start with the standard SELECT
        let sql = `${GAME_CARD_SELECT} ${whereClause} ${GAME_CARD_GROUP} `;

        // Sort Logic
        switch (filters.sort) {
            case 'newest_first':
                sql += ` ORDER BY g.created_at DESC`;
                break;
            case 'highest_rated':
                sql += ` ORDER BY rating DESC`;
                break;
            case 'most_popular':
            default:
                sql += ` ORDER BY g.play_count DESC`;
                break;
        }

        // Pagination
        sql += ` LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
        params.push(filters.limit, filters.offset);

        const { rows } = await db.query(sql, params);
        return rows;
    },
    // Calculates total records matching the filters without the LIMIT/OFFSET
    countSearch: async (filters) => {
        const { sql: whereClause, params } = buildSearchConditions(filters, 1);

        // We only need to count the games, so no complicated joins needed for the count
        // unless we filter by Tag (which is handled in the subquery inside buildSearchConditions)
        const sql = `
            SELECT COUNT(DISTINCT g.game_id)::int as total
            FROM games g
            ${whereClause}
        `;

        const { rows } = await db.query(sql, params);
        return rows[0].total;
    },
    // 6. ดึงข้อมูลหลักของเกม + ผู้สร้าง + การตั้งค่า (Game Settings)
    getGameCoreDetails: async (gameId) => {
        const query = `
            SELECT 
                g.game_id, 
                g.title, 
                g.description, 
                g.cover_image_url, 
                g.difficulty, 
                g.creator_id,
                u.username AS creator_name,
                u.profile_pic_url AS creator_image,
                gs.initial_ammo, 
                gs.hearts_num, 
                gs.ammo_per_correct, 
                gs.enemies_num
            FROM games g
            LEFT JOIN users u ON g.creator_id = u.user_id
            LEFT JOIN game_settings gs ON g.game_id = gs.game_id
            WHERE g.game_id = $1
        `;
        const { rows } = await db.query(query, [gameId]);
        return rows[0]; // คืนค่า object เดียว หรือ undefined ถ้าไม่เจอ
    },

    // 7. ดึงข้อมูลสรุป (จำนวนข้อ, XP รวม, เรตติ้งเฉลี่ย) แยกออกมาเพื่อไม่ให้ Join หนักเกินไป
    getGameAggregates: async (gameId) => {
        const query = `
            SELECT
                (SELECT COUNT(*)::int FROM questions WHERE game_id = $1) AS question_count,
                (SELECT COALESCE(SUM(points), 0)::int FROM questions WHERE game_id = $1) AS total_xp_reward,
                (SELECT COALESCE(AVG(rating), 0)::float FROM reviews WHERE game_id = $1) AS rating
        `;
        const { rows } = await db.query(query, [gameId]);
        return rows[0];
    },

    // 8. ดึง Tags ของเกมนั้นๆ
    getGameTags: async (gameId) => {
        const query = `
            SELECT t.name 
            FROM tags t
            JOIN game_tags_rel gtr ON t.tag_id = gtr.tag_id
            WHERE gtr.game_id = $1
        `;
        const { rows } = await db.query(query, [gameId]);
        // แปลงจาก [{name: 'Math'}, {name: 'Hard'}] -> ['Math', 'Hard'] เพื่อให้ใช้ง่าย
        // แปลงจาก [{name: 'Math'}, {name: 'Hard'}] -> ['Math', 'Hard'] เพื่อให้ใช้ง่าย
        return rows.map(row => row.name);
    },

    getGameKnowledges: async (gameId) => {
        const query = `SELECT * FROM game_knowledge WHERE game_id = $1 ORDER BY knowledge_id ASC`;
        const { rows } = await db.query(query, [gameId]);
        return rows;
    },

    // 9. ดึง Leaderboard 10 อันดับแรก
    getGameLeaderboard: async (gameId) => {
        const query = `
            SELECT 
                u.username, 
                u.profile_pic_url, 
                uga.score
            FROM user_game_activities uga
            JOIN users u ON uga.user_id = u.user_id
            WHERE uga.game_id = $1
            ORDER BY uga.score DESC
            LIMIT 10
        `;
        const { rows } = await db.query(query, [gameId]);
        return rows;
    },

    // 10. ดึงสถิติส่วนตัวของผู้เล่น (ถ้า Login อยู่)
    getUserGlobalStats: async (userId) => {
        if (!userId) return null;

        // 1. ดึง Level และ XP ปัจจุบัน
        const userQuery = `SELECT level, xp FROM users WHERE user_id = $1`;
        const userRes = await db.query(userQuery, [userId]);
        const user = userRes.rows[0];

        if (!user) return null;

        // 2. ดึงสถิติการเล่นทั้งหมด (ชนะ/แพ้)
        const statsQuery = `
            SELECT 
                COUNT(*)::int as total_played,
                COUNT(CASE WHEN is_win = TRUE THEN 1 END)::int as wins,
                COUNT(CASE WHEN is_win = FALSE THEN 1 END)::int as losses
            FROM user_game_activities
            WHERE user_id = $1
        `;
        const statsRes = await db.query(statsQuery, [userId]);
        const stats = statsRes.rows[0];

        // รวมร่างข้อมูลกลับไป
        return { ...user, ...stats };
    },
    // 11. ดึงเกมที่ User กด Favorite ไว้ (ใช้ GAME_CARD_SELECT เพื่อความ Consistency)
    getFavorites: async (userId, limit, offset) => {
        const sql = `
            ${GAME_CARD_SELECT}
            WHERE g.game_id IN (
                SELECT game_id 
                FROM user_game_activities 
                WHERE user_id = $1 AND is_favorite = TRUE
            )
            ${GAME_CARD_GROUP}
            ORDER BY MAX(CASE WHEN uga.user_id = $1 THEN uga.played_at END) DESC
            LIMIT $2 OFFSET $3
        `;

        const { rows } = await db.query(sql, [userId, limit, offset]);
        return rows;
    },
    createGameTransaction: async (userId, payload) => {
        const client = await db.connect();

        try {
            await client.query('BEGIN'); // เริ่ม Transaction

            // ---------------------------------------------------------
            // Step 1: Insert Game Metadata
            // ---------------------------------------------------------
            const gameSql = `
                INSERT INTO games (
                    creator_id, title, description, cover_image_url, 
                    visibility, language, category, difficulty
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING game_id
            `;
            const gameValues = [
                userId,
                payload.title,
                payload.description,
                payload.cover_image_url,
                payload.visibility || 'public',
                payload.language || 'th',
                payload.category,
                payload.difficulty || 'medium'
            ];
            const gameRes = await client.query(gameSql, gameValues);
            const gameId = gameRes.rows[0].game_id;

            // ---------------------------------------------------------
            // Step 2: Handle Tags (Upsert Logic)
            // ---------------------------------------------------------
            if (payload.tags && payload.tags.length > 0) {
                for (const tagName of payload.tags) {
                    const findTagSql = `SELECT tag_id FROM tags WHERE name = $1`;
                    const findTagRes = await client.query(findTagSql, [tagName]);

                    let tagId;
                    if (findTagRes.rows.length > 0) {
                        tagId = findTagRes.rows[0].tag_id;
                    } else {
                        const insertTagSql = `INSERT INTO tags (name) VALUES ($1) RETURNING tag_id`;
                        const insertTagRes = await client.query(insertTagSql, [tagName]);
                        tagId = insertTagRes.rows[0].tag_id;
                    }

                    const linkTagSql = `
                        INSERT INTO game_tags_rel (game_id, tag_id) VALUES ($1, $2) 
                        ON CONFLICT DO NOTHING
                    `;
                    await client.query(linkTagSql, [gameId, tagId]);
                }
            }

            // ---------------------------------------------------------
            // Step 3: Insert Game Settings (Validate & Insert)
            // ---------------------------------------------------------
            const settings = payload.settings || {};

            // Validation: Duration
            const duration = settings.duration_seconds || 180;
            if (duration < 180 || duration > 600) {
                throw new Error('Duration must be between 180 and 600 seconds (3-10 mins).');
            }

            // Validation: Check Map Existence
            if (settings.map_id) {
                const mapCheck = await client.query('SELECT 1 FROM maps WHERE map_id = $1', [settings.map_id]);
                if (mapCheck.rowCount === 0) throw new Error(`Invalid map_id: ${settings.map_id}`);
            }

            const settingsSql = `
                INSERT INTO game_settings (
                    game_id, map_id, duration_seconds, enemies_num, 
                    hearts_num, brains_num, initial_ammo, ammo_per_correct
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            await client.query(settingsSql, [
                gameId,
                settings.map_id,
                duration,
                settings.enemies_num || 0,
                settings.hearts_num || 3,
                settings.brains_num || 0,
                settings.initial_ammo || 0,
                settings.ammo_per_correct || 1
            ]);

            // ---------------------------------------------------------
            // ---------------------------------------------------------
            // Step 3.5: Insert Knowledges
            // ---------------------------------------------------------
            if (payload.knowledges && payload.knowledges.length > 0) {
                for (const k of payload.knowledges) {
                    const kSql = `INSERT INTO game_knowledge (game_id, title, content, media_url) VALUES ($1, $2, $3, $4)`;
                    await client.query(kSql, [gameId, k.title || '', k.content || '', k.media_url || '']);
                }
            }

            // ---------------------------------------------------------
            // Step 4: Insert Questions Loop
            // ---------------------------------------------------------
            if (payload.questions && payload.questions.length > 0) {
                for (const q of payload.questions) {
                    const qSql = `
                        INSERT INTO questions (game_id, question_type, allow_multiple_answers, text, time_limit_seconds, points)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING question_id
                    `;
                    const qRes = await client.query(qSql, [
                        gameId,
                        q.question_type,
                        q.allow_multiple_answers || false,
                        q.text,
                        q.time_limit_seconds || 10,
                        q.points || 10
                    ]);
                    const qId = qRes.rows[0].question_id;

                    // Handle Options
                    if (q.options && q.options.length > 0) {
                        // Validate MCQ options count (optional, can be relaxed if needed)
                        if (q.question_type === 'MCQ' && (q.options.length < 2 || q.options.length > 6)) {
                            // throw new Error(`MCQ Question requires 2-6 options.`);
                        }

                        const optionPromises = q.options.map((opt, index) => {
                            const optSql = `
                                INSERT INTO question_options (question_id, option_text, is_correct, display_order)
                                VALUES ($1, $2, $3, $4)
                            `;
                            return client.query(optSql, [qId, opt.option_text || opt.text || "", opt.is_correct || false, index + 1]);
                        });
                        await Promise.all(optionPromises);
                    }

                    // Handle Media
                    if (q.media && q.media.length > 0) {
                        const mediaPromises = q.media.map((m, index) => {
                            const mSql = `
                                INSERT INTO question_media (question_id, media_url, media_type, file_size_bytes, display_order)
                                VALUES ($1, $2, $3, $4, $5)
                            `;
                            return client.query(mSql, [
                                qId,
                                m.media_url,
                                m.media_type || 'image',
                                m.file_size || 0,
                                index + 1
                            ]);
                        });
                        await Promise.all(mediaPromises);
                    }
                }
            }

            await client.query('COMMIT');
            return gameId;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Transaction Error:", error.message);
            throw error;
        } finally {
            client.release();
        }
    },
    getCreatorDashboard: async (gameId, userId) => {
        const client = await db.connect();
        try {
            // 1. Fetch Basic Game Info + Settings + Map + Ownership Check
            // We join these tables immediately to avoid round trips.
            const gameSql = `
                SELECT 
                    g.game_id, g.creator_id, g.title, g.description, g.cover_image_url, 
                    g.visibility, g.category, g.difficulty, g.language, g.is_ai_generated, g.play_count,
                    gs.duration_seconds, gs.enemies_num, gs.hearts_num, gs.brains_num, 
                    gs.initial_ammo, gs.ammo_per_correct,
                    m.map_id, m.name as map_name, m.image_url as map_image
                FROM games g
                LEFT JOIN game_settings gs ON g.game_id = gs.game_id
                LEFT JOIN maps m ON gs.map_id = m.map_id
                WHERE g.game_id = $1
            `;

            const gameRes = await client.query(gameSql, [gameId]);
            const game = gameRes.rows[0];

            // 404: Game not found
            if (!game) return null;

            // 403: Ownership Check (Strict)
            if (game.creator_id !== userId) {
                const error = new Error('Forbidden: You are not the creator of this game');
                error.status = 403;
                throw error;
            }

            // 2. Fetch Tags
            const tagSql = `
                SELECT t.tag_id, t.name 
                FROM tags t
                JOIN game_tags_rel gtr ON t.tag_id = gtr.tag_id
                WHERE gtr.game_id = $1
            `;

            // 3. Fetch Performance Stats (Aggregates)
            // Calculating win/loss rates and favorites in one go
            const statsSql = `
                SELECT 
                    COUNT(CASE WHEN is_favorite = TRUE THEN 1 END)::int as favorite_count,
                    COUNT(activity_id)::int as total_sessions,
                    COUNT(CASE WHEN is_win = TRUE THEN 1 END)::int as total_wins,
                    COUNT(CASE WHEN is_win = FALSE THEN 1 END)::int as total_losses
                FROM user_game_activities
                WHERE game_id = $1
            `;

            // 4. Fetch Rating
            const ratingSql = `
                SELECT COALESCE(AVG(rating), 0)::float as avg_rating 
                FROM reviews 
                WHERE game_id = $1
            `;

            // 5. Fetch Questions with Nested Options and Media using Postgres JSON functions
            // This avoids N+1 query problems by letting Postgres structure the JSON.
            const questionsSql = `
                SELECT 
                    q.question_id, q.question_type, q.text, q.time_limit_seconds, q.points, q.allow_multiple_answers,
                    COALESCE(
                        (SELECT json_agg(json_build_object(
                            'option_id', qo.option_id,
                            'text', qo.option_text,
                            'is_correct', qo.is_correct
                        ) ORDER BY qo.display_order) 
                        FROM question_options qo 
                        WHERE qo.question_id = q.question_id), 
                    '[]'::json) as options,
                    COALESCE(
                        (SELECT json_agg(json_build_object(
                            'media_id', qm.media_id,
                            'url', qm.media_url,
                            'type', qm.media_type
                        ) ORDER BY qm.display_order) 
                        FROM question_media qm 
                        WHERE qm.question_id = q.question_id), 
                    '[]'::json) as media
                FROM questions q
                WHERE q.game_id = $1
                ORDER BY q.question_id ASC
            `;

            // Execute parallel queries for performance
            const [tagsRes, statsRes, ratingRes, questionsRes] = await Promise.all([
                client.query(tagSql, [gameId]),
                client.query(statsSql, [gameId]),
                client.query(ratingSql, [gameId]),
                client.query(questionsSql, [gameId])
            ]);

            const stats = statsRes.rows[0];
            const avgRating = ratingRes.rows[0].avg_rating;

            // --- Construct Response Object ---

            // Calculate Rates
            const totalRecordedPlays = stats.total_sessions || 0;
            const winRate = totalRecordedPlays > 0 ? ((stats.total_wins / totalRecordedPlays) * 100).toFixed(2) : 0;
            const lossRate = totalRecordedPlays > 0 ? ((stats.total_losses / totalRecordedPlays) * 100).toFixed(2) : 0;

            return {
                configuration: {
                    details: {
                        id: game.game_id,
                        title: game.title,
                        description: game.description,
                        coverImage: game.cover_image_url,
                        visibility: game.visibility,
                        difficulty: game.difficulty,
                        category: game.category,
                        language: game.language,
                        aiGenerated: game.is_ai_generated
                    },
                    settings: {
                        map: {
                            id: game.map_id,
                            name: game.map_name,
                            image: game.map_image
                        },
                        rules: {
                            duration: game.duration_seconds,
                            enemies: game.enemies_num,
                            hearts: game.hearts_num,
                            brains: game.brains_num,
                            initialAmmo: game.initial_ammo,
                            ammoPerCorrect: game.ammo_per_correct
                        }
                    },
                    tags: tagsRes.rows,
                    questions: questionsRes.rows // Contains nested options/media via SQL JSON
                },
                performance: {
                    totalPlayers: game.play_count, // From games table
                    favorites: stats.favorite_count,
                    averageRating: parseFloat(avgRating).toFixed(1),
                    analytics: {
                        totalSessionsRecorded: totalRecordedPlays,
                        wins: stats.total_wins,
                        losses: stats.total_losses,
                        winRatePercent: parseFloat(winRate),
                        lossRatePercent: parseFloat(lossRate)
                    }
                }
            };

        } finally {
            client.release();
        }
    },
    updateGameTransaction: async (gameId, userId, payload) => {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // --- Step 1: Security & Ownership Check ---
            // Lock the row to prevent concurrent edits
            const checkSql = `SELECT creator_id FROM games WHERE game_id = $1 FOR UPDATE`;
            const checkRes = await client.query(checkSql, [gameId]);

            if (checkRes.rows.length === 0) {
                throw { status: 404, message: 'Game not found' };
            }
            if (checkRes.rows[0].creator_id !== userId) {
                throw { status: 403, message: 'Forbidden: You do not own this game' };
            }

            // --- Step 2: Update Game Metadata (Step A) ---
            const updateGameSql = `
            UPDATE games 
            SET title = $1, description = $2, cover_image_url = $3, 
                visibility = $4, category = $5, difficulty = $6, 
                language = $7, is_ai_generated = $8, updated_at = CURRENT_TIMESTAMP
            WHERE game_id = $9
        `;
            await client.query(updateGameSql, [
                payload.title, payload.description, payload.cover_image_url,
                payload.visibility, payload.category, payload.difficulty,
                payload.language, payload.is_ai_generated, gameId
            ]);

            // Update Settings
            const updateSettingsSql = `
            UPDATE game_settings
            SET map_id = $1, duration_seconds = $2, enemies_num = $3, 
                hearts_num = $4, brains_num = $5, initial_ammo = $6, 
                ammo_per_correct = $7
            WHERE game_id = $8
        `;
            await client.query(updateSettingsSql, [
                payload.settings.map_id, payload.settings.duration_seconds,
                payload.settings.enemies_num, payload.settings.hearts_num,
                payload.settings.brains_num, payload.settings.initial_ammo,
                payload.settings.ammo_per_correct, gameId
            ]);

            // --- Step 3: Tags - Reset Strategy (Step B) ---
            await client.query(`DELETE FROM game_tags_rel WHERE game_id = $1`, [gameId]);

            if (payload.tags && payload.tags.length > 0) {
                for (const tagName of payload.tags) {
                    // Find or Create Tag
                    let tagRes = await client.query(`SELECT tag_id FROM tags WHERE name = $1`, [tagName]);
                    let tagId;
                    if (tagRes.rows.length > 0) {
                        tagId = tagRes.rows[0].tag_id;
                    } else {
                        const newTag = await client.query(`INSERT INTO tags (name) VALUES ($1) RETURNING tag_id`, [tagName]);
                        tagId = newTag.rows[0].tag_id;
                    }
                    // Link Tag
                    await client.query(`INSERT INTO game_tags_rel (game_id, tag_id) VALUES ($1, $2)`, [gameId, tagId]);
                }
            }

            // --- Step 3.5: Knowledge Sync (New) ---
            await client.query(`DELETE FROM game_knowledge WHERE game_id = $1`, [gameId]);
            if (payload.knowledges && payload.knowledges.length > 0) {
                for (const k of payload.knowledges) {
                    await client.query(
                        `INSERT INTO game_knowledge (game_id, title, content, media_url) VALUES ($1, $2, $3, $4)`,
                        [gameId, k.title || '', k.content || '', k.media_url || '']
                    );
                }
            }

            // --- Step 4: Questions - The Sync Logic (Step C) ---

            // 4.1 Fetch Existing IDs
            const existingQRes = await client.query(`SELECT question_id FROM questions WHERE game_id = $1`, [gameId]);
            const existingIds = existingQRes.rows.map(r => r.question_id);

            // 4.2 Identify Payload IDs (Questions being updated)
            const payloadQuestionIds = payload.questions
                .filter(q => q.question_id) // Only those with IDs
                .map(q => q.question_id);

            // 4.3 Identify Deletions (In DB but not in Payload)
            const idsToDelete = existingIds.filter(id => !payloadQuestionIds.includes(id));

            if (idsToDelete.length > 0) {
                // Options/Media cascade delete automatically via FK, but explicit is safer for logic tracking
                // We rely on ON DELETE CASCADE in schema for sub-items here
                await client.query(`DELETE FROM questions WHERE question_id = ANY($1::int[])`, [idsToDelete]);
            }

            // 4.4 Loop Payload Questions (Update or Insert)
            for (const q of payload.questions) {
                let currentQId = q.question_id;

                if (currentQId && existingIds.includes(currentQId)) {
                    // CASE 1: UPDATE
                    // We add AND game_id = $... as an extra safety measure
                    const updateQSql = `
                    UPDATE questions 
                    SET question_type = $1, allow_multiple_answers = $2, 
                        text = $3, time_limit_seconds = $4, points = $5
                    WHERE question_id = $6 AND game_id = $7
                `;
                    await client.query(updateQSql, [
                        q.question_type, q.allow_multiple_answers, q.text,
                        q.time_limit_seconds, q.points, currentQId, gameId
                    ]);
                } else {
                    // CASE 2: INSERT (New Question)
                    const insertQSql = `
                    INSERT INTO questions (game_id, question_type, allow_multiple_answers, text, time_limit_seconds, points)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING question_id
                `;
                    const newQRes = await client.query(insertQSql, [
                        gameId, q.question_type, q.allow_multiple_answers,
                        q.text, q.time_limit_seconds, q.points
                    ]);
                    currentQId = newQRes.rows[0].question_id;
                }

                // --- Step 5: Options & Media - Reset Strategy (Step D) ---
                // "Reset" is safer than diffing options (prevents ordering bugs)

                // 5.1 Delete existing sub-items for this specific question
                await Promise.all([
                    client.query(`DELETE FROM question_options WHERE question_id = $1`, [currentQId]),
                    client.query(`DELETE FROM question_media WHERE question_id = $1`, [currentQId])
                ]);

                // 5.2 Insert New Options (Batch using Promise.all)
                if (q.options && q.options.length > 0) {
                    const optionPromises = q.options.map((opt, idx) => {
                        return client.query(
                            `INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, $2, $3, $4)`,
                            [currentQId, opt.option_text, opt.is_correct || false, idx + 1]
                        );
                    });
                    await Promise.all(optionPromises);
                }

                // 5.3 Insert New Media (Batch using Promise.all)
                if (q.media && q.media.length > 0) {
                    const mediaPromises = q.media.map((m, idx) => {
                        return client.query(
                            `INSERT INTO question_media (question_id, media_url, media_type, file_size_bytes, display_order) VALUES ($1, $2, $3, $4, $5)`,
                            [currentQId, m.media_url, m.media_type || 'image', m.file_size_bytes || 0, idx + 1]
                        );
                    });
                    await Promise.all(mediaPromises);
                }
            }

            await client.query('COMMIT');
            return true;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error; // Re-throw to controller
        } finally {
            client.release();
        }
    },
    deleteGameTransaction: async (gameId, userId) => {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Ownership Check & Lock
            const checkSql = `
            SELECT creator_id, cover_image_url 
            FROM games 
            WHERE game_id = $1 
            FOR UPDATE
        `;
            const checkRes = await client.query(checkSql, [gameId]);

            if (checkRes.rows.length === 0) {
                throw { status: 404, message: 'Game not found' };
            }
            if (checkRes.rows[0].creator_id !== userId) {
                throw { status: 403, message: 'Forbidden: You do not own this game' };
            }

            // 2. Collect Orphaned Files (For cleanup later)
            // We need to grab these BEFORE deleting the game
            const filesToDelete = [];

            // 2.1 Game Cover Image
            if (checkRes.rows[0].cover_image_url) {
                filesToDelete.push(checkRes.rows[0].cover_image_url);
            }

            // 2.2 Question Media
            const mediaSql = `
            SELECT qm.media_url 
            FROM question_media qm
            JOIN questions q ON qm.question_id = q.question_id
            WHERE q.game_id = $1
        `;
            const mediaRes = await client.query(mediaSql, [gameId]);
            mediaRes.rows.forEach(row => {
                if (row.media_url) filesToDelete.push(row.media_url);
            });

            // 3. Perform Delete
            // Because of 'ON DELETE CASCADE' in your schema, 
            // this single line removes questions, settings, options, reviews, etc.
            await client.query(`DELETE FROM games WHERE game_id = $1`, [gameId]);

            await client.query('COMMIT');

            // Return the list of files so the Controller can clean them up from storage
            return { success: true, filesToDelete };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
    /**
     * Fetch aggregate stats for the creator's dashboard
     */
    getCreatorStats: async (userId) => {
        const sql = `
            SELECT 
                COUNT(*)::int as total_games,
                COUNT(CASE WHEN visibility = 'public' THEN 1 END)::int as total_published,
                COALESCE(SUM(play_count), 0)::int as total_players,
                COALESCE(AVG(r.rating), 0)::float as avg_rating
            FROM games g
            LEFT JOIN reviews r ON g.game_id = r.game_id
            WHERE g.creator_id = $1
        `;
        const { rows } = await db.query(sql, [userId]);
        return rows[0];
    },

    /**
     * Fetch list of games created by user with detailed counts
     * Uses subqueries for accuracy to avoid join duplication
     */
    getCreatorGames: async (userId, limit, offset) => {
        const sql = `
            SELECT 
                g.game_id,
                g.title,
                g.cover_image_url,
                g.created_at,
                g.visibility,
                g.category,
                g.difficulty,
                g.play_count,
                
                -- Subquery: Question Count
                (SELECT COUNT(*)::int FROM questions q WHERE q.game_id = g.game_id) as question_count,
                
                -- Subquery: Total XP (Sum of points)
                (SELECT COALESCE(SUM(points), 0)::int FROM questions q WHERE q.game_id = g.game_id) as total_xp,
                
                -- Subquery: Knowledge Count (New Requirement)
                (SELECT COUNT(*)::int FROM game_knowledge gk WHERE gk.game_id = g.game_id) as knowledge_count,
                
                -- Subquery: Ratings
                (SELECT COALESCE(AVG(rating), 0)::float FROM reviews r WHERE r.game_id = g.game_id) as rating_score,
                (SELECT COUNT(*)::int FROM reviews r WHERE r.game_id = g.game_id) as rating_count

            FROM games g
            WHERE g.creator_id = $1
            ORDER BY g.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const { rows } = await db.query(sql, [userId, limit, offset]);
        return rows;
    }
};


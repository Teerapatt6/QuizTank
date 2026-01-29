const db = require('../config/db');

module.exports = {
    /**
     * Ensures challenges exist for the user for the specific period (Day or Week).
     * If not, it auto-assigns random ones.
     */
    getOrAssignChallenges: async (userId, type, dateRef) => {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Check if challenges exist for this user & date reference
            // For Daily: dateRef = Today
            // For Weekly: dateRef = Monday of this week
            const checkSql = `
                SELECT 
                    uc.id, uc.current_progress, uc.is_completed, uc.assigned_date,
                    c.challenge_id, c.title, c.description, c.difficulty, 
                    c.target_value, c.xp_reward, c.badge_image_url, c.type
                FROM user_challenges uc
                JOIN challenges c ON uc.challenge_id = c.challenge_id
                WHERE uc.user_id = $1 
                  AND uc.assigned_date = $2
                  AND c.type = $3
            `;
            const { rows } = await client.query(checkSql, [userId, dateRef, type]);

            if (rows.length > 0) {
                await client.query('COMMIT');
                return rows; // Return existing
            }

            // 2. No challenges found? Auto-Assign!
            // Fetch random challenges from master table (e.g., 3 for Daily, 1 for Weekly)
            const limit = type === 'DAILY' ? 3 : 1;
            
            const randomSql = `
                SELECT challenge_id FROM challenges 
                WHERE type = $1 
                ORDER BY RANDOM() 
                LIMIT $2
            `;
            const randomRes = await client.query(randomSql, [type, limit]);

            if (randomRes.rows.length === 0) {
                await client.query('COMMIT');
                return []; // No master challenges defined yet
            }

            // 3. Insert into user_challenges
            const insertValues = randomRes.rows.map(r => 
                `(${userId}, ${r.challenge_id}, '${dateRef.toISOString().split('T')[0]}')`
            ).join(',');

            const insertSql = `
                INSERT INTO user_challenges (user_id, challenge_id, assigned_date)
                VALUES ${insertValues}
                RETURNING id
            `;
            await client.query(insertSql);

            // 4. Fetch the newly created data to return full details
            const { rows: newRows } = await client.query(checkSql, [userId, dateRef, type]);
            
            await client.query('COMMIT');
            return newRows;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Get History of completed challenges
     */
    getCompletedHistory: async (userId, limit, offset) => {
        const sql = `
            SELECT 
                uc.id, uc.completed_at,
                c.title, c.description, c.xp_reward, c.badge_image_url
            FROM user_challenges uc
            JOIN challenges c ON uc.challenge_id = c.challenge_id
            WHERE uc.user_id = $1 AND uc.is_completed = TRUE
            ORDER BY uc.completed_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        // Count total for meta
        const countSql = `SELECT COUNT(*)::int as total FROM user_challenges WHERE user_id = $1 AND is_completed = TRUE`;
        
        const [dataRes, countRes] = await Promise.all([
            db.query(sql, [userId, limit, offset]),
            db.query(countSql, [userId])
        ]);

        return {
            data: dataRes.rows,
            total: countRes.rows[0].total
        };
    }
};
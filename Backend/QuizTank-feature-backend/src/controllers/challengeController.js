const challengeModel = require('../models/challengeModel');

// Helper: Calculate seconds until next midnight UTC
const getSecondsUntilDailyReset = () => {
    const now = new Date();
    const nextDaily = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    return Math.floor((nextDaily - now) / 1000);
};

// Helper: Calculate seconds until next Sunday midnight UTC
const getSecondsUntilWeeklyReset = () => {
    const now = new Date();
    const daysUntilNextSunday = (7 - now.getUTCDay()) % 7 || 7;
    const nextWeekly = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilNextSunday, 0, 0, 0));
    return Math.floor((nextWeekly - now) / 1000);
};

// Helper: Get UTC date string (YYYY-MM-DD) for the period
const getUTCDateRef = (type) => {
    const now = new Date();

    if (type === 'DAILY') {
        // Today in UTC
        return now.toISOString().split('T')[0];
    } else {
        // Find Sunday of this week in UTC
        const dayOfWeek = now.getUTCDay(); // 0 = Sunday
        const diff = now.getUTCDate() - dayOfWeek;
        const sunday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
        return sunday.toISOString().split('T')[0];
    }
};

exports.getChallenges = async (req, res) => {
    try {
        const { tab } = req.query; // 'daily', 'weekly', 'completed'
        const userId = req.user?.id;

        // --- CASE 1: Completed History ---
        if (tab === 'completed') {
            if (!userId) return res.json({ meta: { completedCount: 0 }, challenges: [] });

            const completedChallenges = await challengeModel.getCompletedChallenges(userId);

            const formattedCompleted = await Promise.all(completedChallenges.map(async c => {
                const gameRoomIds = c.game_room || [];
                const totalGames = gameRoomIds.length;
                return {
                    id: c.challenge_id,
                    title: c.title,
                    description: c.description,
                    difficulty: c.difficulty,
                    xp: c.xp,
                    completedAt: c.completed_at,
                    totalGames: totalGames
                };
            }));

            return res.json({
                meta: { completedCount: formattedCompleted.length },
                challenges: formattedCompleted
            });
        }

        // --- CASE 2: Active Challenges (Daily/Weekly) ---
        const type = tab === 'weekly' ? 'WEEKLY' : 'DAILY';
        const dateRef = getUTCDateRef(type);

        // Fetch active challenges
        let rawChallenges = await challengeModel.getActiveChallenges(type, dateRef);

        // Filter out challenges that are already claimed
        if (userId) {
            const claimedIds = new Set(
                (await challengeModel.getCompletedChallenges(userId)).map(c => c.challenge_id)
            );
            rawChallenges = rawChallenges.filter(c => !claimedIds.has(c.challenge_id));
        }

        // Calculate Meta Data
        const timeUntilReset = type === 'WEEKLY' ? getSecondsUntilWeeklyReset() : getSecondsUntilDailyReset();
        const totalXp = rawChallenges.reduce((sum, c) => sum + (c.xp || 0), 0);

        // Format Response with progress
        const formattedChallenges = await Promise.all(rawChallenges.map(async c => {
            const gameRoomIds = c.game_room || [];
            const totalGames = gameRoomIds.length;
            const progress = userId ? await challengeModel.getUserProgress(userId, gameRoomIds) : 0;
            const isCompleted = totalGames > 0 && progress >= totalGames;
            const rewardClaimed = userId ? await challengeModel.isRewardClaimed(userId, c.challenge_id) : false;

            return {
                id: c.challenge_id,
                title: c.title,
                description: c.description,
                difficulty: c.difficulty,
                xp: c.xp,
                gameRoom: c.game_room,
                status: c.status,
                typeId: c.type_id,
                startDate: c.start_date,
                createdAt: c.created_at,
                progress: progress,
                totalGames: totalGames,
                isCompleted: isCompleted,
                rewardClaimed: rewardClaimed
            };
        }));

        return res.json({
            meta: {
                timeUntilResetSeconds: timeUntilReset,
                activeCount: formattedChallenges.length,
                totalXpEarned: totalXp
            },
            challenges: formattedChallenges
        });

    } catch (error) {
        console.error("Get Challenges Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

/**
 * Get challenge details by ID with all games
 */
exports.getChallengeById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get challenge details
        const challenge = await challengeModel.getById(id);

        if (!challenge || challenge.status === 2) {
            return res.status(404).json({ error: "Challenge not found" });
        }

        // Get game details for each game in game_room array
        const gameRoomModel = require('../models/gameRoomModel');
        const gameRoomIds = challenge.game_room || [];

        const games = [];
        for (const gameId of gameRoomIds) {
            const game = await gameRoomModel.getById(gameId);
            if (game) {
                games.push({
                    id: game.id,
                    name: game.name,
                    game_code: game.game_code,
                    cover_image: game.cover_image,
                    category: game.category,
                    description: game.description,
                    duration: game.duration,
                    questionCount: Array.isArray(game.questions) ? game.questions.length : 0,
                    // Include stats for difficulty calculation
                    knowledgeCount: Array.isArray(game.knowledges) ? game.knowledges.length : 0,
                    enemies: game.enemies,
                    hearts: game.hearts,
                    brains: game.brains,
                    initial_ammo: game.initial_ammo,
                    ammo_per_correct: game.ammo_per_correct
                });
            }
        }

        // Calculate time until reset based on challenge type
        const timeUntilReset = challenge.type_id === 2
            ? getSecondsUntilWeeklyReset()
            : getSecondsUntilDailyReset();

        // Get user progress
        const userId = req.user?.id;
        const progress = userId ? await challengeModel.getUserProgress(userId, gameRoomIds) : 0;
        const completedGameIds = userId ? await challengeModel.getCompletedGameIds(userId, gameRoomIds) : [];
        const totalGames = games.length;
        const isCompleted = totalGames > 0 && progress >= totalGames;
        const rewardClaimed = userId ? await challengeModel.isRewardClaimed(userId, challenge.challenge_id) : false;

        return res.json({
            id: challenge.challenge_id,
            title: challenge.title,
            description: challenge.description,
            difficulty: challenge.difficulty,
            xp: challenge.xp,
            status: challenge.status,
            typeId: challenge.type_id,
            startDate: challenge.start_date,
            timeUntilResetSeconds: timeUntilReset,
            progress: progress,
            totalGames: totalGames,
            isCompleted: isCompleted,
            rewardClaimed: rewardClaimed,
            completedGameIds: completedGameIds,
            games: games
        });

    } catch (error) {
        console.error("Get Challenge By ID Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

/**
 * Claim reward for completing a challenge
 * POST /challenges/:id/claim
 */
exports.claimReward = async (req, res) => {
    try {
        const challengeId = parseInt(req.params.id);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!challengeId) {
            return res.status(400).json({ error: 'Invalid challenge ID' });
        }

        const result = await challengeModel.claimReward(userId, challengeId);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.json({
            success: true,
            xp: result.xp,
            message: `You earned ${result.xp} XP!`
        });

    } catch (error) {
        console.error("Claim Reward Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
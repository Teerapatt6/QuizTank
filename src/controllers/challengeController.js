const challengeModel = require('../models/challengeModel');

// Helper: Calculate seconds until next midnight
const getSecondsUntilDailyReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return Math.floor((tomorrow - now) / 1000);
};

// Helper: Calculate seconds until next Sunday midnight
const getSecondsUntilWeeklyReset = () => {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7 + 1); // Jump to next reset day
    if(now.getDay() === 0) nextSunday.setDate(now.getDate() + 1); // Special case if today is Sunday
    nextSunday.setHours(0, 0, 0, 0);
    return Math.floor((nextSunday - now) / 1000);
};

// Helper: Get Date Object for the start of the period (for DB querying)
const getAssignmentDateRef = (type) => {
    const now = new Date();
    now.setHours(0,0,0,0);
    
    if (type === 'DAILY') {
        return now; // Today 00:00
    } else {
        // Find last Monday (or Sunday depending on region, assume Monday is start)
        const day = now.getDay() || 7; // Get current day number, make Sunday (0) -> 7
        if (day !== 1) now.setHours(-24 * (day - 1)); 
        return now; // Monday 00:00
    }
};

exports.getChallenges = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { tab } = req.query; // 'daily', 'weekly', 'completed'

        // --- CASE 1: Completed History ---
        if (tab === 'completed') {
            const history = await challengeModel.getCompletedHistory(userId, 20, 0);
            
            return res.json({
                meta: {
                    completedCount: history.total
                },
                challenges: history.data.map(c => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    rewards: {
                        xp: c.xp_reward,
                        badge: c.badge_image_url
                    },
                    completedAt: c.completed_at,
                    isCompleted: true
                }))
            });
        }

        // --- CASE 2: Active Challenges (Daily/Weekly) ---
        const type = tab === 'weekly' ? 'WEEKLY' : 'DAILY';
        const dateRef = getAssignmentDateRef(type);

        // Fetch (or create if missing)
        const rawChallenges = await challengeModel.getOrAssignChallenges(userId, type, dateRef);

        // Calculate Meta Data
        const timeUntilReset = type === 'WEEKLY' ? getSecondsUntilWeeklyReset() : getSecondsUntilDailyReset();
        const activeCount = rawChallenges.filter(c => !c.is_completed).length;
        const totalXpEarned = rawChallenges
            .filter(c => c.is_completed)
            .reduce((sum, c) => sum + c.xp_reward, 0);

        // Format Response
        const formattedChallenges = rawChallenges.map(c => {
            const progressPercent = Math.min(100, Math.floor((c.current_progress / c.target_value) * 100));
            
            return {
                id: c.id, // User Challenge ID
                iconUrl: c.badge_image_url, // Or a specific icon column if you have one
                title: c.title,
                description: c.description,
                difficulty: c.difficulty,
                progress: {
                    current: c.current_progress,
                    target: c.target_value,
                    percentage: progressPercent
                },
                rewards: {
                    xp: c.xp_reward,
                    badge: c.badge_image_url
                },
                isCompleted: c.is_completed
            };
        });

        return res.json({
            meta: {
                timeUntilResetSeconds: timeUntilReset,
                totalXpEarned: totalXpEarned,
                activeCount: activeCount
            },
            challenges: formattedChallenges
        });

    } catch (error) {
        console.error("Get Challenges Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
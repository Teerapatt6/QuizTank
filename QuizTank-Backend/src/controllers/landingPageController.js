const GameModel = require('../models/gameModel'); // Old model (for other functions)
const gameRoomModel = require('../models/gameRoomModel'); // New simplified model

module.exports = {
    getRecentGames: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 8;
            // Get userId if exists (optionalAuth)
            const userId = req.user ? (req.user.user_id || req.user.id) : null;

            // Use new gameRoomModel
            const games = await gameRoomModel.getRecent(limit, userId);

            // Format response
            const formatted = games.map(g => ({
                id: g.id,
                title: g.name,
                name: g.name,
                category: g.category,
                tags: g.tags || [],
                cover_image: g.cover_image,
                questionCount: g.question_count || 0,
                duration: g.duration,
                creator_name: g.creator_name,
                rating: g.rating || 0,
                play_count: g.play_count || 0,
                isAiGenerated: g.ai_generated === 1,
                imageUrl: g.cover_image,
                gameCode: g.game_code,
                isFavourite: !!g.is_favourite,
                gameStats: {
                    questions: g.question_count || 0,
                    knowledges: Array.isArray(g.knowledges) ? g.knowledges.length : 0,
                    enemies: g.enemies || 2,
                    duration: g.duration || 4,
                    hearts: g.hearts || 3,
                    brains: g.brains || 4,
                    initial_ammo: g.initial_ammo || 50,
                    ammo_per_correct: g.ammo_per_correct || 5
                }
            }));

            res.json(formatted);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server Error" });
        }
    },

    checkGamePin: async (req, res) => {
        try {
            const { pin } = req.params;

            // Try to find by Game Code (or ID if we wanted to support legacy)
            // But we prefer Code now.
            const game = await gameRoomModel.getByCode(pin);

            if (!game) {
                return res.json({ valid: false, message: "Game not found" });
            }
            if (game.status === 2 || game.visibility === 2) {
                // Draft or Private -> treat as not found/invalid code
                return res.json({ valid: false, message: "Game not found" });
            }

            res.json({ valid: true, game_id: game.id, game_code: game.game_code, title: game.name });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server Error" });
        }
    },

    // 1. Trending Games (use new gameRoomModel)
    getTrendingGames: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 8;
            const userId = req.user ? (req.user.user_id || req.user.id) : null;

            // Use new gameRoomModel
            const games = await gameRoomModel.getTrending(limit, userId);

            // Format response
            const formatted = games.map(g => ({
                id: g.id,
                title: g.name,
                name: g.name,
                category: g.category,
                tags: g.tags || [],
                cover_image: g.cover_image,
                questionCount: g.question_count || 0,
                duration: g.duration,
                creator_name: g.creator_name,
                rating: g.rating || 0,
                play_count: g.play_count || 0,
                week_play_count: g.week_play_count || 0,
                isAiGenerated: g.ai_generated === 1,
                imageUrl: g.cover_image,
                gameCode: g.game_code,
                isFavourite: !!g.is_favourite,
                gameStats: {
                    questions: g.question_count || 0,
                    knowledges: Array.isArray(g.knowledges) ? g.knowledges.length : 0,
                    enemies: g.enemies || 2,
                    duration: g.duration || 4,
                    hearts: g.hearts || 3,
                    brains: g.brains || 4,
                    initial_ammo: g.initial_ammo || 50,
                    ammo_per_correct: g.ammo_per_correct || 5
                }
            }));

            res.json(formatted);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server Error fetching trending games" });
        }
    },

    // 2. Popular AI Games (use new gameRoomModel)
    getPopularAiGames: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 8;
            const userId = req.user ? (req.user.user_id || req.user.id) : null;

            // Use new gameRoomModel
            const games = await gameRoomModel.getAiGeneratedTrending(limit, userId);

            const formatted = games.map(g => ({
                id: g.id,
                title: g.name,
                name: g.name,
                category: g.category,
                tags: g.tags || [],
                cover_image: g.cover_image,
                questionCount: g.question_count || 0,
                duration: g.duration,
                creator_name: g.creator_name,
                rating: g.rating || 0,
                play_count: g.play_count || 0,
                week_play_count: g.week_play_count || 0,
                isAiGenerated: true,
                imageUrl: g.cover_image,
                gameCode: g.game_code,
                game_code: g.game_code,
                isFavourite: !!g.is_favourite,
                gameStats: {
                    questions: g.question_count || 0,
                    knowledges: Array.isArray(g.knowledges) ? g.knowledges.length : 0,
                    enemies: g.enemies || 2,
                    duration: g.duration || 4,
                    hearts: g.hearts || 3,
                    brains: g.brains || 4,
                    initial_ammo: g.initial_ammo || 50,
                    ammo_per_correct: g.ammo_per_correct || 5
                }
            }));

            res.json(formatted);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server Error fetching AI games" });
        }
    },
    // Search Games (use new gameRoomModel)
    searchGames: async (req, res) => {
        try {
            const { q } = req.query;
            const limit = parseInt(req.query.limit) || 20;

            // Use new gameRoomModel search
            const games = await gameRoomModel.search(q || '', limit);

            const formatted = games.map(g => ({
                id: g.id,
                title: g.name,
                name: g.name,
                category: g.category,
                tags: g.tags || [],
                description: g.description,
                cover_image: g.cover_image,
                questionCount: (g.questions || []).length,
                duration: g.duration,
                creator_name: g.creator_name
            }));

            res.json(formatted);

        } catch (err) {
            console.error("Search Error:", err);
            res.status(500).json({ message: "Server Error during search" });
        }
    },
    // ฟังก์ชันดึงข้อมูล Navbar (รูปโปรไฟล์, เลเวล)
    getUserNavbar: async (req, res) => {
        try {
            // 1. รับ ID จาก Middleware (verifyToken ต้องแกะ token แล้วใส่ใน req.user)
            // เช็คโค้ด middleware คุณว่าใช้ req.user.id หรือ req.user.userId
            const userId = req.user.user_id || req.user.id;

            // 2. เรียก Model ไปดึงข้อมูล (เอาแค่ที่จำเป็นต้องโชว์)
            const user = await UserModel.getNavbarInfo(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // 3. ส่งข้อมูลกลับไป
            res.json({
                username: user.username,
                profile_pic_url: user.profile_pic_url,
                level: user.level,
                xp: user.xp,
                role: user.role // เผื่อเอาไว้โชว์เมนู Admin
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server Error" });
        }
    },

    // Contact Form Submission
    submitContact: async (req, res) => {
        try {
            const { name, email, subject, message } = req.body;

            // Validate input
            if (!name || !email || !message) {
                return res.status(400).json({ message: "Please fill in all required fields." });
            }

            const emailService = require('../services/emailService');
            await emailService.sendContactEmail(name, email, subject || 'No Subject', message);

            res.json({ success: true, message: "Your message has been sent successfully." });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to send message. Please try again later." });
        }
    }
};
const GameModel = require('../models/gameModel'); // เรียกใช้ Model

module.exports = {
    getRecentGames: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 8;
            const offset = (page - 1) * limit;

            // Controller สั่งงาน Model แค่บรรทัดเดียว!
            const games = await GameModel.getRecent(limit, offset);
            
            res.json(games);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server Error" });
        }
    },

    checkGamePin: async (req, res) => {
        try {
            const { pin } = req.params;
            
            // เรียกใช้ Model
            const game = await GameModel.findByPin(pin);

            if (!game) {
                return res.status(404).json({ message: "Game not found" });
            }
            if (game.visibility === 'private') {
                return res.status(403).json({ message: "This game is private" });
            }

            res.json({ valid: true, game_id: game.game_id, title: game.title });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server Error" });
        }
    },

// 1. Trending Games (ดึงเกมตาม play_count)
    getTrendingGames: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 8;
            const offset = (page - 1) * limit; // คำนวณจุดเริ่มต้นข้อมูล

            // ส่งทั้ง limit และ offset ไปให้ Model
            const games = await GameModel.getTrending(limit, offset);
            
            res.json(games);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server Error fetching trending games" });
        }
    },

    // 2. Popular AI Games (ดึงเกม AI ตาม play_count)
    getPopularAiGames: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 8;
            const offset = (page - 1) * limit;

            // ส่งทั้ง limit และ offset ไปให้ Model
            const games = await GameModel.getPopularAi(limit, offset);
            
            res.json(games);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server Error fetching AI games" });
        }
    },
    // ฟังก์ชันใหม่: Search Games
    searchGames: async (req, res) => {
        try {
            // 1. รับค่าจาก Query String (URL)
            const { q, category, difficulty, sort, page } = req.query;

            // 2. ตั้งค่า Pagination
            const pageNum = parseInt(page) || 1;
            const limit = 8; // แสดงหน้าละ 8 เกม
            const offset = (pageNum - 1) * limit;

            // 3. เตรียม Object filters เพื่อส่งให้ Model
            const filters = {
                term: q,                      // คำค้นหา (Keyword)
                category: category || 'all',  // ถ้าไม่ส่งมา ให้ถือว่าเป็น all
                difficulty: difficulty || 'all',
                sort: sort || 'most_popular', // Default คือ ยอดนิยม
                limit,
                offset
            };

            // 4. เรียก Model
            const games = await GameModel.search(filters);

            res.json(games);

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
    }
};
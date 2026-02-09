const gameModel = require('../models/gameModel');
const cloudinary = require('../config/cloudinary');

// --- Helper Functions ---

// ฟังก์ชันจำลองการลบไฟล์จาก Cloud Storage (เช่น S3)
// ในอนาคตคุณต้องเขียน Logic จริงใส่ตรงนี้
const deleteFilesFromStorage = async (fileUrls) => {
    if (!fileUrls || fileUrls.length === 0) return;

    console.log(`[System] Background task: Deleting ${fileUrls.length} files from storage...`);
    // ตัวอย่าง: 
    // await s3.deleteObjects({ 
    //    Bucket: 'my-bucket', 
    //    Delete: { Objects: fileUrls.map(url => ({ Key: url })) } 
    // });
};

const getGameDetailById = async (req, res) => {
    const gameId = parseInt(req.params.id);
    // Assuming authentication middleware sets req.user.id if a token is present
    const userId = req.user ? req.user.id : null;

    if (isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid Game ID' });
    }

    try {
        // Execute independent queries in parallel for performance
        const [coreDetails, aggregates, tags, leaderboard, knowledges, userStats] = await Promise.all([
            gameModel.getGameCoreDetails(gameId),
            gameModel.getGameAggregates(gameId),
            gameModel.getGameTags(gameId),
            gameModel.getGameLeaderboard(gameId),
            gameModel.getGameKnowledges(gameId),
            userId ? gameModel.getUserGlobalStats(userId) : Promise.resolve(null)
        ]);

        // Handle 404
        if (!coreDetails) {
            return res.status(404).json({ error: 'Game not found' });
        }

        // --- Format Response Sections ---

        // 1. Game Card Section
        const gameCard = {
            basicInfo: {
                coverImageUrl: coreDetails.cover_image_url,
                title: coreDetails.title,
                creatorName: coreDetails.creator_name, // Joined from users
                difficulty: coreDetails.difficulty,
            },
            stats: {
                questionCount: aggregates.question_count,
                totalXpReward: aggregates.total_xp_reward,
                rating: parseFloat(aggregates.rating.toFixed(1)), // Ensure specific precision
                tags: tags,
            }
        };

        // 2. Info & Leaderboard Section
        const infoAndLeaderboard = {
            tab1_gameInfo: {
                description: coreDetails.description,
                settings: {
                    initialAmmo: coreDetails.initial_ammo,
                    heartsNum: coreDetails.hearts_num,
                    ammoPerCorrect: coreDetails.ammo_per_correct,
                    enemiesNum: coreDetails.enemies_num,
                },
                knowledges: knowledges.map(k => ({
                    title: k.title,
                    content: k.content,
                    mediaUrl: k.media_url
                }))
            },
            tab2_leaderboard: leaderboard.map((entry, index) => ({
                rank: index + 1,
                username: entry.username,
                profilePic: entry.profile_pic_url,
                score: entry.score,
            }))
        };

        // 3. User Progress Section (Calculated only if user exists)
        let userProgress = null;
        if (userStats) {
            const nextLevelXp = userStats.level * 1000; // Requirement logic
            const totalPlayed = userStats.total_played;

            // Avoid division by zero
            const passedRate = totalPlayed > 0
                ? ((userStats.wins / totalPlayed) * 100).toFixed(1) + '%'
                : '0%';

            const failedRate = totalPlayed > 0
                ? ((userStats.losses / totalPlayed) * 100).toFixed(1) + '%'
                : '0%';

            userProgress = {
                levelingInfo: {
                    level: userStats.level,
                    xp: parseInt(userStats.xp),
                    nextLevelXp: nextLevelXp,
                },
                globalPerformance: {
                    totalPlayed: totalPlayed,
                    passedRate: passedRate,
                    failedRate: failedRate,
                }
            };
        }

        // Final Response Construction
        return res.status(200).json({
            gameCard,
            infoAndLeaderboard,
            userProgress // Will be null if guest
        });

    } catch (err) {
        console.error('Error in getGameDetailById:', err);
        // Pass to global error handler or send generic error
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getFavoriteGames = async (req, res) => {
    try {
        // 1. Extract User ID from Token (middleware must run before this)
        const userId = req.user.user_id;

        // 2. Pagination Logic
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 3. Call Model
        const games = await gameModel.getFavorites(userId, limit, offset);

        // 4. Return Response
        res.status(200).json({
            data: games,
            page: page,
            limit: limit
        });

    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createGameWizard = async (req, res) => {
    try {
        // 1. แกะ User ID จาก Token
        const userId = req.user.user_id;

        // 2. รับ Payload (Assumes validation middleware handles basics)
        const payload = req.body;

        // Basic Check
        if (!payload.title || !payload.questions || payload.questions.length === 0) {
            return res.status(400).json({ error: "Title and at least 1 question are required." });
        }

        // 3. เรียก Model ที่เป็น Transaction
        const newGameId = await gameModel.createGameTransaction(userId, payload);

        // 4. ตอบกลับ
        res.status(201).json({
            success: true,
            message: "Game created successfully",
            gameId: newGameId
        });

    } catch (error) {
        console.error("Create Game Controller Error:", error);

        // แยก Error เพื่อสื่อสารให้ชัดเจน
        if (error.message.includes('Duration') || error.message.includes('MCQ') || error.message.includes('map_id')) {
            return res.status(400).json({ error: error.message }); // Client Error (ข้อมูลผิด)
        }

        res.status(500).json({ error: "Internal Server Error while creating game." });
    }
};

// 4. Get Creator Dashboard (แก้ไขใหม่ แยกออกมาแล้ว)
const getDashboard = async (req, res, next) => {
    try {
        const gameId = parseInt(req.params.id);
        const userId = req.user.user_id;

        if (isNaN(gameId)) {
            return res.status(400).json({ error: 'Invalid Game ID' });
        }

        // แก้ GameModel เป็น gameModel (ตามที่ประกาศข้างบนสุด)
        const dashboardData = await gameModel.getCreatorDashboard(gameId, userId);

        if (!dashboardData) {
            return res.status(404).json({ error: 'Game not found' });
        }

        return res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        if (error.status === 403) {
            return res.status(403).json({ error: error.message });
        }
        next(error);
    }
};

const updateGame = async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);
        const userId = req.user.user_id; // From Token
        const payload = req.body;

        // Basic Validation
        if (isNaN(gameId)) {
            return res.status(400).json({ error: 'Invalid Game ID' });
        }
        if (!payload.title || !payload.questions || payload.questions.length === 0) {
            return res.status(400).json({ error: "Title and at least 1 question are required." });
        }

        // Call Model
        await gameModel.updateGameTransaction(gameId, userId, payload);

        return res.status(200).json({
            success: true,
            message: 'Game updated successfully'
        });

    } catch (error) {
        console.error("Update Game Error:", error);

        // Handle Specific Status Codes
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }

        // Handle DB Errors
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Database constraint violation' });
        }

        res.status(500).json({ error: 'Internal Server Error during update' });
    }
};

const deleteGame = async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);
        const userId = req.user.user_id;

        if (isNaN(gameId)) {
            return res.status(400).json({ error: 'Invalid Game ID' });
        }

        // 1. เรียก Model เพื่อลบข้อมูลใน DB และรับรายชื่อไฟล์ที่ต้องลบทิ้ง
        const result = await gameModel.deleteGameTransaction(gameId, userId);

        // 2. สั่งลบไฟล์ (Fire and Forget - ไม่ต้องรอให้เสร็จค่อยตอบกลับ user)
        // ถ้ามีไฟล์ต้องลบ ให้ส่งไปทำใน Background
        if (result.filesToDelete && result.filesToDelete.length > 0) {
            deleteFilesFromStorage(result.filesToDelete).catch(err =>
                console.error('[Error] Failed to clean up files:', err)
            );
        }

        return res.status(200).json({
            success: true,
            message: 'Game and associated data deleted successfully.'
        });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('Delete Game Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getMyGames = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        // Parse Pagination Params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Execute queries in parallel
        const [stats, games] = await Promise.all([
            gameModel.getCreatorStats(userId),
            gameModel.getCreatorGames(userId, limit, offset)
        ]);

        // Calculate Pagination Metadata
        const totalItems = stats.total_games || 0;
        const totalPages = Math.ceil(totalItems / limit);

        // Format Response
        const response = {
            stats: {
                totalGames: totalItems,
                totalPublished: stats.total_published,
                totalPlayers: stats.total_players,
                avgRating: parseFloat(stats.avg_rating.toFixed(1)) // e.g., 4.8
            },
            games: {
                data: games.map(g => ({
                    id: g.game_id, // Acts as PIN
                    title: g.title,
                    coverImage: g.cover_image_url,
                    createdAt: g.created_at, // ISO Timestamp
                    status: g.visibility === 'public' ? 'Published' : 'Draft', // UI Mapping logic
                    visibility: g.visibility,
                    category: g.category,
                    difficulty: g.difficulty,
                    metrics: {
                        plays: g.play_count,
                        questions: g.question_count,
                        knowledges: g.knowledge_count,
                        totalXp: g.total_xp
                    },
                    rating: {
                        score: parseFloat(g.rating_score.toFixed(1)),
                        count: g.rating_count
                    }
                })),
                pagination: {
                    page: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPages: totalPages
                }
            }
        };

        return res.status(200).json(response);

    } catch (error) {
        console.error('Get My Games Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const uploadGameMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // Convert buffer to data URI
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: process.env.CLOUDINARY_FOLDER_GAMES || "quiztank/games",
            resource_type: "auto"
        });

        res.json({
            success: true,
            url: result.secure_url,
            type: result.resource_type
        });
    } catch (error) {
        console.error("Upload Media Error:", error);
        res.status(500).json({ error: "Upload failed" });
    }
};

module.exports = {
    getGameDetailById,
    getFavoriteGames,
    createGameWizard,
    getDashboard,
    updateGame,
    deleteGame,
    deleteGame,
    getMyGames,
    uploadGameMedia
};
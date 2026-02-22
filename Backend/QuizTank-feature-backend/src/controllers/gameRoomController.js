const gameRoomModel = require('../models/gameRoomModel');
const gameReportModel = require('../models/gameReportModel');

/**
 * Game Room Controller - Simplified API for game_rooms table
 */

// Create a new game
const createGame = async (req, res) => {
    try {
        const userId = req.user.id;
        const gameData = req.body;

        // Validate required fields
        if (!gameData.name || gameData.name.trim() === '') {
            return res.status(400).json({ error: 'Game name is required' });
        }

        const { id, gameCode } = await gameRoomModel.create(userId, gameData);

        res.status(201).json({
            success: true,
            message: 'Game created successfully',
            gameId: id,
            gameCode: gameCode
        });
    } catch (error) {
        console.error('Create Game Error:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
};

// Get game by ID or Code
const getGameById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : null;

        let game;
        // Check if input is likely a Game ID (numeric) or Game Code (alphanumeric)
        if (/^\d+$/.test(id)) {
            game = await gameRoomModel.getById(id, userId);
        } else {
            game = await gameRoomModel.getByCode(id, userId);
        }

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        // Format response for frontend
        const response = {
            id: game.id,
            name: game.name,
            status: game.status,
            visibility: game.visibility,
            is_unlocked: game.is_unlocked,
            category: game.category,
            language: game.language,
            tags: game.tags || [],
            description: game.description,
            cover_image: game.cover_image,
            questions: game.questions || [],
            knowledges: game.knowledges || [],
            duration: game.duration,
            enemies: game.enemies,
            hearts: game.hearts,
            brains: game.brains,
            initial_ammo: game.initial_ammo,
            ammo_per_correct: game.ammo_per_correct,
            questions_order: game.questions_order,
            knowledges_order: game.knowledges_order,
            map: game.map,
            creator_name: game.creator_name,
            creator_full_name: game.creator_full_name,
            creator_avatar: game.creator_avatar,
            ai_generated: !!game.ai_generated,
            game_code: game.game_code,
            created_at: game.created_at,
            created_at: game.created_at,
            updated_at: game.updated_at,
            rating: game.rating || 0,
            rating_count: game.rating_count || 0,
            favorites_count: game.favorites_count || 0
        };

        // Include password only if the requester is the creator
        if (req.user && String(req.user.id) === String(game.user_id)) {
            response.password = game.password;
        }

        res.json(response);
    } catch (error) {
        console.error('Get Game Error:', error);
        res.status(500).json({ error: 'Failed to get game' });
    }
};

// Get user's games (My Games)
const getMyGames = async (req, res) => {
    try {
        const userId = req.user.id;
        const games = await gameRoomModel.getByUserId(userId);

        // Format for frontend
        const formatted = games.map(g => ({
            id: g.id,
            name: g.name,
            status: g.status,
            visibility: g.visibility,
            category: g.category,
            tags: g.tags || [],
            cover_image: g.cover_image,
            questionCount: (g.questions || []).length,
            knowledgeCount: (g.knowledges || []).length,
            duration: g.duration,
            created_at: g.created_at,
            updated_at: g.updated_at,
            password: g.password,
            created_at: g.created_at,
            updated_at: g.updated_at,
            password: g.password,
            gameCode: g.game_code,
            rating: g.rating || 0,
            rating_count: g.rating_count || 0,
            play_count: g.play_count || 0
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get My Games Error:', error);
        res.status(500).json({ error: 'Failed to get games' });
    }
};

// Get public games
const getPublicGames = async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        const userId = req.user ? req.user.id : null;
        const games = await gameRoomModel.getPublicGames(parseInt(limit), parseInt(offset), userId);

        const formatted = games.map(g => ({
            id: g.id,
            name: g.name,
            category: g.category,
            tags: g.tags || [],
            description: g.description,
            cover_image: g.cover_image,
            questions: g.questions,
            knowledges: g.knowledges,
            enemies: g.enemies,
            hearts: g.hearts,
            brains: g.brains,
            initial_ammo: g.initial_ammo,
            ammo_per_correct: g.ammo_per_correct,
            duration: g.duration,
            creator_name: g.creator_name,
            created_at: g.created_at,
            is_favourite: !!g.is_favourite,
            ai_generated: !!g.ai_generated,
            is_favourite: !!g.is_favourite,
            ai_generated: !!g.ai_generated,
            gameCode: g.game_code,
            rating: g.rating || 0,
            rating_count: g.rating_count || 0,
            play_count: g.play_count || 0
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get Public Games Error:', error);
        res.status(500).json({ error: 'Failed to get games' });
    }
};

// Search games
const searchGames = async (req, res) => {
    try {
        const { q, limit = 20, offset = 0, sortBy } = req.query;

        if (!q || q.trim() === '') {
            return res.json([]);
        }

        const userId = req.user ? req.user.id : null;
        const games = await gameRoomModel.search(q, parseInt(limit), userId, parseInt(offset), sortBy);

        const formatted = games.map(g => ({
            id: g.id,
            name: g.name,
            category: g.category,
            tags: g.tags || [],
            description: g.description,
            cover_image: g.cover_image,
            questions: g.questions,
            knowledges: g.knowledges,
            enemies: g.enemies,
            hearts: g.hearts,
            brains: g.brains,
            initial_ammo: g.initial_ammo,
            ammo_per_correct: g.ammo_per_correct,
            duration: g.duration,
            creator_name: g.creator_name,
            created_at: g.created_at,
            is_favourite: !!g.is_favourite,
            ai_generated: !!g.ai_generated,
            is_favourite: !!g.is_favourite,
            ai_generated: !!g.ai_generated,
            gameCode: g.game_code,
            rating: g.rating || 0,
            rating_count: g.rating_count || 0,
            play_count: g.play_count || 0
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Search Games Error:', error);
        res.status(500).json({ error: 'Failed to search games' });
    }
};

// Get related games
const getRelatedGames = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 8 } = req.query;
        const userId = req.user ? req.user.id : null;

        const games = await gameRoomModel.getRelated(id, parseInt(limit), userId);

        const formatted = games.map(g => ({
            id: g.id,
            title: g.name,
            name: g.name,
            description: g.description,
            image: g.cover_image,
            category: g.category,
            tags: g.tags,

            // Stats for difficulty calculation
            questions: g.questions,
            knowledges: g.knowledges,
            enemies: g.enemies,
            hearts: g.hearts,
            brains: g.brains,
            initial_ammo: g.initial_ammo,
            ammo_per_correct: g.ammo_per_correct,
            duration: g.duration,

            xp: 100, // Placeholder
            rating: g.rating || 0,
            rating_count: g.rating_count || 0,
            play_count: g.play_count || 0,
            difficulty: "Medium", // Fallback
            creator_name: g.creator_name,
            isFavourite: !!g.is_favourite,
            ai_generated: !!g.ai_generated,
            gameCode: g.game_code
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get Related Games Error:', error);
        res.status(500).json({ error: 'Failed to get related games' });
    }
};

// Update game
const updateGame = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const gameData = req.body;

        // Fetch current state BEFORE update to check for changes
        const currentGame = await gameRoomModel.getById(id);

        const result = await gameRoomModel.update(id, userId, gameData);

        if (!result) {
            return res.status(404).json({ error: 'Game not found or not authorized' });
        }

        // Determine if we need to revoke access
        let shouldRevoke = false;

        // 1. Password changed
        if (gameData.password !== undefined && currentGame && gameData.password !== currentGame.password) {
            shouldRevoke = true;
        }

        // 2. Visibility changed to Public (1) or Private (2)
        if (gameData.visibility !== undefined) {
            const newVis = parseInt(gameData.visibility);
            if (newVis === 1 || newVis === 2) {
                shouldRevoke = true;
            }
        }

        if (shouldRevoke) {
            await gameRoomModel.revokeAllAccess(id);
        }

        res.json({
            success: true,
            message: 'Game updated successfully',
            gameId: result.id
        });
    } catch (error) {
        console.error('Update Game Error:', error);
        res.status(500).json({ error: 'Failed to update game' });
    }
};

// Delete game (soft delete)
const deleteGame = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await gameRoomModel.delete(id, userId);

        if (!result) {
            return res.status(404).json({ error: 'Game not found or not authorized' });
        }

        res.json({
            success: true,
            message: 'Game deleted successfully'
        });
    } catch (error) {
        console.error('Delete Game Error:', error);
        res.status(500).json({ error: 'Failed to delete game' });
    }
};

// Get recent games
const getRecentGames = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const games = await gameRoomModel.getRecent(parseInt(limit));

        const formatted = games.map(g => ({
            id: g.id,
            name: g.name,
            category: g.category,
            tags: g.tags || [],
            cover_image: g.cover_image,
            questionCount: (g.questions || []).length,
            duration: g.duration,
            creator_name: g.creator_name,
            ai_generated: !!g.ai_generated
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get Recent Games Error:', error);
        res.status(500).json({ error: 'Failed to get recent games' });
    }
};

// Get trending games
const getTrendingGames = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const games = await gameRoomModel.getTrending(parseInt(limit));

        const formatted = games.map(g => ({
            id: g.id,
            name: g.name,
            category: g.category,
            tags: g.tags || [],
            cover_image: g.cover_image,
            questionCount: (g.questions || []).length,
            duration: g.duration,
            creator_name: g.creator_name,
            ai_generated: !!g.ai_generated
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get Trending Games Error:', error);
        res.status(500).json({ error: 'Failed to get trending games' });
    }
};

const verifyPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        const isValid = await gameRoomModel.verifyPassword(id, password);

        if (isValid) {
            if (req.user && req.user.id) {
                await gameRoomModel.unlockGame(req.user.id, id);
            }
            res.json({ success: true, message: 'Password verified' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getUserGames = async (req, res) => {
    try {
        const { username } = req.params;
        const { limit = 20, offset = 0, sortBy } = req.query;
        const userId = req.user ? req.user.id : null;
        const games = await gameRoomModel.getByUsername(username, userId, parseInt(limit), parseInt(offset), sortBy);

        const formatted = games.map(g => ({
            id: g.id,
            name: g.name,
            category: g.category,
            tags: g.tags || [],
            description: g.description,
            cover_image: g.cover_image,
            questions: g.questions,
            knowledges: g.knowledges,
            enemies: g.enemies,
            hearts: g.hearts,
            brains: g.brains,
            initial_ammo: g.initial_ammo,
            ammo_per_correct: g.ammo_per_correct,
            duration: g.duration,
            creator_name: g.creator_name,
            created_at: g.created_at,
            is_favourite: !!g.is_favourite,
            ai_generated: !!g.ai_generated,
            gameCode: g.game_code,
            rating: g.rating || 0,
            rating_count: g.rating_count || 0,
            play_count: g.play_count || 0
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get User Games Error:', error);
        res.status(500).json({ error: 'Failed to get user games' });
    }
};

// Report a game
const reportGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const report = await gameReportModel.create(userId, id, reason);
        res.status(201).json(report);
    } catch (error) {
        console.error('Report Game Error:', error);
        res.status(500).json({ error: 'Failed to report game' });
    }
};

// Check report status
const checkReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : null;

        if (!userId) {
            return res.json({ reported: false });
        }

        const reported = await gameReportModel.checkExisting(userId, id);
        res.json({ reported });
    } catch (error) {
        console.error('Check Report Status Error:', error);
        res.status(500).json({ error: 'Failed to check report status' });
    }
};

module.exports = {
    createGame,
    getGameById,
    getMyGames,
    getPublicGames,
    searchGames,
    getRelatedGames,
    updateGame,
    deleteGame,
    getRecentGames,
    getTrendingGames,
    verifyPassword,
    getUserGames,
    reportGame,
    checkReportStatus
};

const gamePlayModel = require('../models/gamePlayModel');
const gameRoomModel = require('../models/gameRoomModel');

/**
 * Start a new game play
 */
exports.startPlay = async (req, res) => {
    try {
        const { gameRoomId } = req.body;
        const userId = req.user.id; // From authMiddleware

        if (!gameRoomId) {
            return res.status(400).json({ error: "Game Room ID is required" });
        }

        // Check game status
        const game = await gameRoomModel.getById(gameRoomId, userId);
        if (game && (game.status === 2 || game.status === 3)) {
            // Draft or Removed: Do not save to DB
            return res.json({
                id: 0,
                game_room_id: gameRoomId,
                user_id: userId,
                status: 1,
                mock: true
            });
        }

        const newPlay = await gamePlayModel.create(gameRoomId, userId);
        res.json(newPlay);

    } catch (error) {
        console.error("Start Play Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

/**
 * End a game play (Win, Lost, Cancel)
 */
exports.endPlay = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, completionTime } = req.body;

        if (id == 0) {
            return res.json({
                id: 0,
                status: status,
                completion_time: completionTime,
                mock: true
            });
        }

        // Validation
        if (![2, 3, 4].includes(status)) {
            return res.status(400).json({ error: "Invalid status. Must be 2 (Win), 3 (Lost), or 4 (Canceled)" });
        }

        const updatedPlay = await gamePlayModel.updateStatus(id, status, completionTime);

        if (!updatedPlay) {
            return res.status(404).json({ error: "Play record not found" });
        }

        res.json(updatedPlay);

    } catch (error) {
        console.error("End Play Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

/**
 * Get all game plays (Admin)
 */
exports.getAllGamePlays = async (req, res) => {
    try {
        const plays = await gamePlayModel.getAll();
        res.json(plays);
    } catch (error) {
        console.error("Get All Game Plays Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

/**
 * Get leaderboard
 */
exports.getLeaderboard = async (req, res) => {
    try {
        const { gameId } = req.params;
        const leaderboard = await gamePlayModel.getLeaderboard(gameId);
        res.json(leaderboard);
    } catch (error) {
        console.error("Get Leaderboard Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

/**
 * Get game stats (total plays, user stats)
 */
exports.getGameStats = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user?.id || null; // Optional - user may not be logged in

        const stats = await gamePlayModel.getGameStats(gameId, userId);
        res.json(stats);
    } catch (error) {
        console.error("Get Game Stats Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

/**
 * Get user's history for a game
 */
exports.getGameHistory = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.id; // Require login

        const history = await gamePlayModel.getGameHistory(gameId, userId);
        res.json(history);
    } catch (error) {
        console.error("Get Game History Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

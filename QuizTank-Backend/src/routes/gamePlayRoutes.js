const express = require('express');
const router = express.Router();
const gamePlayController = require('../controllers/gamePlayController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/game-plays/start
 * @desc    Start a new game session
 * @access  Private
 */
router.post('/start', authMiddleware.verifyToken, gamePlayController.startPlay);

/**
 * @route   PUT /api/game-plays/:id/end
 * @desc    End a game session (Win/Loss/Cancel)
 * @access  Private
 */
router.put('/:id/end', authMiddleware.verifyToken, gamePlayController.endPlay);

/**
 * @route   GET /api/game-plays
 * @desc    Get all game plays (Admin only)
 * @access  Private/Admin
 */
router.get(
    '/',
    authMiddleware.verifyToken,
    authMiddleware.verifyAdmin,
    gamePlayController.getAllGamePlays
);

/**
 * @route   GET /api/game-plays/leaderboard/:gameId
 * @desc    Get leaderboard for a game
 * @access  Public
 */
router.get('/leaderboard/:gameId', gamePlayController.getLeaderboard);

/**
 * @route   GET /api/game-plays/stats/:gameId
 * @desc    Get game stats (total plays, user stats)
 * @access  Public (optional auth for user-specific stats)
 */
router.get('/stats/:gameId', authMiddleware.optionalAuth, gamePlayController.getGameStats);

/**
 * @route   GET /api/game-plays/history/:gameId
 * @desc    Get user's play history for a game
 * @access  Private
 */
router.get('/history/:gameId', authMiddleware.verifyToken, gamePlayController.getGameHistory);

module.exports = router;

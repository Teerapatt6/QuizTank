const express = require('express');
const router = express.Router();
const landingPageController = require('../controllers/landingPageController');
const { optionalAuth, verifyToken } = require('../middlewares/authMiddleware');
const gameController = require('../controllers/gameController');
const upload = require('../middlewares/upload');

// Public Routes (ไม่ต้อง Login)
router.get('/check-pin/:pin', landingPageController.checkGamePin);
router.get('/recent', landingPageController.getRecentGames);
router.get('/trending', landingPageController.getTrendingGames);
router.get('/popular-ai', landingPageController.getPopularAiGames);
router.get('/search', landingPageController.searchGames); // Search มักจะเป็น Publics

// Private Routes (ต้อง Login - มี verifyToken)
router.get('/me-navbar', verifyToken, landingPageController.getUserNavbar);
router.get('/favorites', verifyToken, gameController.getFavoriteGames);
router.post('/', verifyToken, gameController.createGameWizard);
router.post('/media', verifyToken, upload.single('file'), gameController.uploadGameMedia);

// Hybrid / Dynamic Routes (วางไว้ท้ายสุด)
router.get('/:id/details', optionalAuth, gameController.getGameDetailById);

/**
 * @route   GET /api/games/:id/dashboard
 * @desc    Get full configuration and performance stats for a game
 * @access  Private (Creator only)
 */
router.get(
    '/:id/dashboard',
    verifyToken, // Ensures req.user exists
    gameController.getDashboard
);
/**
 * @route   PUT /api/games/:id
 * @desc    Update an existing game (Full Sync)
 * @access  Private (Creator only)
 */
router.put(
    '/:id',
    verifyToken,
    gameController.updateGame
);
/**
 * @route   DELETE /api/games/:id
 * @desc    Delete a game permanently
 * @access  Private (Creator only)
 */
router.delete(
    '/:id',
    verifyToken,
    gameController.deleteGame
);
/**
 * @route   GET /api/games/my-games
 * @desc    Get dashboard stats and list of created games
 * @access  Private (Creator/User)
 */
router.get(
    '/my-games',
    verifyToken,
    gameController.getMyGames
);

module.exports = router;
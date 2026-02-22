const express = require('express');
const router = express.Router();
const gameRoomController = require('../controllers/gameRoomController');
const favouriteController = require('../controllers/favouriteController');
const { verifyToken, optionalAuth } = require('../middlewares/authMiddleware');

/**
 * Game Room Routes - Simplified API for game_rooms table
 */

// Public routes (no auth required, but optional for favorites status)
router.get('/public', optionalAuth, gameRoomController.getPublicGames);
router.get('/user/:username', optionalAuth, gameRoomController.getUserGames);
router.get('/recent', gameRoomController.getRecentGames);
router.get('/trending', gameRoomController.getTrendingGames);
router.get('/search', optionalAuth, gameRoomController.searchGames);

// My games - requires auth (must be before /:id to avoid conflict)
router.get('/my-games', verifyToken, gameRoomController.getMyGames);

// Favourites
router.get('/my-favourites', verifyToken, favouriteController.getMyFavourites);
router.get('/:gameId/favourite', verifyToken, favouriteController.checkFavouriteStatus);
router.post('/favourite/add', verifyToken, favouriteController.addFavourite);
router.post('/favourite/remove', verifyToken, favouriteController.removeFavourite);

// Get single game (public view)
router.get('/:id/related', optionalAuth, gameRoomController.getRelatedGames);
router.get('/:id/report', optionalAuth, gameRoomController.checkReportStatus);
router.get('/:id', optionalAuth, gameRoomController.getGameById);
router.post('/:id/verify-password', optionalAuth, gameRoomController.verifyPassword);

// Protected routes (auth required)
router.post('/', verifyToken, gameRoomController.createGame);
router.post('/:id/report', verifyToken, gameRoomController.reportGame);
router.put('/:id', verifyToken, gameRoomController.updateGame);
router.delete('/:id', verifyToken, gameRoomController.deleteGame);

module.exports = router;

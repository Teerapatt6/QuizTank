const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

// Get user review
router.get('/:gameId', authMiddleware.verifyToken, reviewController.getMyReview);

// Submit (Upsert) Review
router.post('/:gameId', authMiddleware.verifyToken, reviewController.submitReview);

module.exports = router;

const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/challenges
 * @desc    Get Daily, Weekly, or Completed challenges
 * @access  Private
 */
// 1. Get List (Optional Auth for Guests)
router.get(
    '/',
    authMiddleware.optionalAuth,
    challengeController.getChallenges
);

// 2. Get Details (Optional Auth for Guests)
router.get(
    '/:id',
    authMiddleware.optionalAuth,
    challengeController.getChallengeById
);

/**
 * @route   POST /api/challenges/:id/claim
 * @desc    Claim reward for completing a challenge
 * @access  Private
 */
router.post(
    '/:id/claim',
    authMiddleware.verifyToken,
    challengeController.claimReward
);

module.exports = router;
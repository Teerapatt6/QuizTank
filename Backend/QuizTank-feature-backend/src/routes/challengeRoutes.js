const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/challenges
 * @desc    Get Daily, Weekly, or Completed challenges
 * @access  Private
 */
router.get(
    '/',
    authMiddleware.verifyToken,
    challengeController.getChallenges
);

/**
 * @route   GET /api/challenges/:id
 * @desc    Get challenge details by ID with games
 * @access  Private
 */
router.get(
    '/:id',
    authMiddleware.verifyToken,
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
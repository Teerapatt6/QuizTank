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

module.exports = router;
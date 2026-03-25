const reviewModel = require('../models/reviewModel');
const gameRoomModel = require('../models/gameRoomModel');

const reviewController = {
    // Submit (Upsert) Review
    submitReview: async (req, res) => {
        try {
            const userId = req.user.id;
            const gameId = req.params.gameId;
            const { rating } = req.body;

            // Validate rating
            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Rating must be between 1 and 5' });
            }

            // Check if game exists and if user is creator
            const game = await gameRoomModel.getById(gameId);
            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }

            if (game.user_id === userId) {
                return res.status(403).json({ error: 'You cannot review your own game.' });
            }

            // Check if user has played
            const hasPlayed = await reviewModel.hasPlayed(userId, gameId);
            if (!hasPlayed) {
                return res.status(403).json({ error: 'You must complete the game to review.' });
            }

            const review = await reviewModel.upsertReview(userId, gameId, rating);
            res.json(review);
        } catch (error) {
            console.error("Submit Review Error:", error);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    // Get My Review
    getMyReview: async (req, res) => {
        try {
            const userId = req.user.id;
            const gameId = req.params.gameId;

            const review = await reviewModel.getUserReview(userId, gameId);

            if (!review) {
                return res.json({ rating: 0 }); // 0 means not reviewed yet
            }
            res.json(review);
        } catch (error) {
            console.error("Get Review Error:", error);
            res.status(500).json({ error: 'Server Error' });
        }
    }
};

module.exports = reviewController;

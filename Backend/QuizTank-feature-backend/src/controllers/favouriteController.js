const favouriteModel = require('../models/favouriteModel');

const checkFavouriteStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const gameId = req.params.gameId;

        const status = await favouriteModel.checkStatus(userId, gameId);

        // Return boolean usually easier for frontend logic
        // status 1 = true (is favourite), others = false
        res.json({
            isFavourite: status === 1,
            status: status
        });
    } catch (error) {
        console.error('Check Favourite Error:', error);
        res.status(500).json({ error: 'Failed to check favourite status' });
    }
};

const addFavourite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { gameId } = req.body;

        const status = await favouriteModel.add(userId, gameId);

        res.json({
            success: true,
            isFavourite: status === 1,
            message: 'Added to favourites'
        });
    } catch (error) {
        console.error('Add Favourite Error:', error);
        res.status(500).json({ error: 'Failed to add favourite' });
    }
};

const removeFavourite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { gameId } = req.body;

        const status = await favouriteModel.remove(userId, gameId);

        res.json({
            success: true,
            isFavourite: status === 1, // Should be false/2
            message: 'Removed from favourites'
        });
    } catch (error) {
        console.error('Remove Favourite Error:', error);
        res.status(500).json({ error: 'Failed to remove favourite' });
    }
};

const getMyFavourites = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = req.query.offset ? parseInt(req.query.offset) : ((page - 1) * limit);
        const sortBy = req.query.sortBy;

        const favourites = await favouriteModel.getUserFavourites(userId, limit, offset, sortBy);

        res.json(favourites);
    } catch (error) {
        console.error('Get Favourites Error:', error);
        res.status(500).json({ error: 'Failed to fetch favourites' });
    }
};

module.exports = {
    checkFavouriteStatus,
    addFavourite,
    removeFavourite,
    getMyFavourites
};

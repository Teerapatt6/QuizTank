const MapModel = require('../models/mapModel');

const MapController = {
    getAllMaps: async (req, res) => {
        try {
            const maps = await MapModel.getAll();
            res.json(maps);
        } catch (error) {
            console.error('Error fetching maps:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getMapById: async (req, res) => {
        try {
            const map = await MapModel.getById(req.params.id);
            if (!map) {
                return res.status(404).json({ error: 'Map not found' });
            }
            res.json(map);
        } catch (error) {
            console.error('Error fetching map:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    createMap: async (req, res) => {
        try {
            const newMap = await MapModel.create(req.body);
            res.status(201).json(newMap);
        } catch (error) {
            console.error('Error creating map:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    updateMap: async (req, res) => {
        try {
            const updatedMap = await MapModel.update(req.params.id, req.body);
            if (!updatedMap) {
                return res.status(404).json({ error: 'Map not found' });
            }
            res.json(updatedMap);
        } catch (error) {
            console.error('Error updating map:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    deleteMap: async (req, res) => {
        try {
            await MapModel.delete(req.params.id);
            res.json({ message: 'Map deleted successfully' });
        } catch (error) {
            console.error('Error deleting map:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

module.exports = MapController;

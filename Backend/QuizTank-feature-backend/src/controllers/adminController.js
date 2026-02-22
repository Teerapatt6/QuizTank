const UserModel = require('../models/userModel');
const GameRoomModel = require('../models/gameRoomModel');
const GameReportModel = require('../models/gameReportModel');
const OptionModel = require('../models/optionModel');
const ChallengeModel = require('../models/challengeModel');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

module.exports = {
    // Users
    getAllUsers: async (req, res) => {
        try {
            const users = await UserModel.getAllUsers();
            res.json(users);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error fetching users' });
        }
    },

    getUserById: async (req, res) => {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error fetching user' });
        }
    },

    createUser: async (req, res) => {
        try {
            const { username, email, password, role, status, full_name, biography, profile_pic_url, is_verified } = req.body;

            // Check if user already exists
            const existingUser = await UserModel.checkDuplicate(username, email);
            if (existingUser) {
                return res.status(400).json({ error: 'Username or Email already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            const newUser = await UserModel.createUser({
                username,
                email,
                password_hash,
                role,
                status,
                full_name,
                biography,
                profile_pic_url,
                is_verified
            });
            res.status(201).json(newUser);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error creating user' });
        }
    },

    updateUser: async (req, res) => {
        try {
            const data = { ...req.body };

            if (data.password) {
                const salt = await bcrypt.genSalt(10);
                data.password_hash = await bcrypt.hash(data.password, salt);
                delete data.password;
            }

            const updatedUser = await UserModel.adminUpdateUser(req.params.id, data);
            if (!updatedUser) return res.status(404).json({ error: 'User not found' });
            res.json(updatedUser);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error updating user' });
        }
    },

    // Games
    getAllGames: async (req, res) => {
        try {
            const filters = {};
            if (req.query.role) filters.role = req.query.role;

            const games = await GameRoomModel.getAllAdmin(filters);
            res.json(games);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error fetching games' });
        }
    },

    getGameById: async (req, res) => {
        try {
            const game = await GameRoomModel.getByIdAdmin(req.params.id);
            if (!game) return res.status(404).json({ error: 'Game not found' });
            res.json(game);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error fetching game' });
        }
    },

    updateGame: async (req, res) => {
        try {
            const updatedGame = await GameRoomModel.updateAdmin(req.params.id, req.body);
            if (!updatedGame) return res.status(404).json({ error: 'Game not found' });
            res.json(updatedGame);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error updating game' });
        }
    },

    createGame: async (req, res) => {
        try {
            const { user_id, ...gameData } = req.body;
            // Use provided user_id or fallback to current admin ID
            const creatorId = user_id || req.user.id;
            const result = await GameRoomModel.create(creatorId, gameData);
            res.status(201).json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error creating game' });
        }
    },

    // Reports
    getAllReports: async (req, res) => {
        try {
            const reports = await GameReportModel.getAll();
            res.json(reports);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error fetching reports' });
        }
    },

    getReportById: async (req, res) => {
        try {
            const report = await GameReportModel.getById(req.params.id);
            if (!report) return res.status(404).json({ error: 'Report not found' });
            res.json(report);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error fetching report' });
        }
    },

    updateReport: async (req, res) => {
        try {
            const updatedReport = await GameReportModel.update(req.params.id, req.body);
            if (!updatedReport) return res.status(404).json({ error: 'Report not found' });
            res.json(updatedReport);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error updating report' });
        }
    },

    // Options
    getAllOptions: async (req, res) => {
        try {
            const options = await OptionModel.getAll();
            res.json(options);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error fetching options' });
        }
    },

    updateOption: async (req, res) => {
        try {
            const { key, value } = req.body;
            const updatedOption = await OptionModel.update(key, value);
            res.json(updatedOption);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error updating option' });
        }
    },

    // Challenges
    getAllChallenges: async (req, res) => {
        try {
            const challenges = await ChallengeModel.getAll();
            res.json(challenges);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error fetching challenges' });
        }
    },

    getChallengeById: async (req, res) => {
        try {
            const challenge = await ChallengeModel.getById(req.params.id);
            if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
            res.json(challenge);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error fetching challenge' });
        }
    },

    createChallenge: async (req, res) => {
        try {
            const challenge = await ChallengeModel.create(req.body);
            res.status(201).json(challenge);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error creating challenge' });
        }
    },

    updateChallenge: async (req, res) => {
        try {
            const challenge = await ChallengeModel.update(req.params.id, req.body);
            if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
            res.json(challenge);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error updating challenge' });
        }
    },

    deleteChallenge: async (req, res) => {
        try {
            const deleted = await ChallengeModel.delete(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Challenge not found' });
            res.json({ message: 'Challenge deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error deleting challenge' });
        }
    },

    // Stats
    getDashboardStats: async (req, res) => {
        try {
            const usersQuery = 'SELECT COUNT(*) FROM users';
            const gamesQuery = 'SELECT COUNT(*) FROM game_rooms';
            const reportsQuery = 'SELECT COUNT(*) FROM game_reports';
            const challengesQuery = 'SELECT COUNT(*) FROM challenges';
            const playsQuery = 'SELECT COUNT(*) FROM game_plays';
            const mapsQuery = 'SELECT COUNT(*) FROM maps';

            const [usersRes, gamesRes, reportsRes, challengesRes, playsRes, mapsRes] = await Promise.all([
                db.query(usersQuery),
                db.query(gamesQuery),
                db.query(reportsQuery),
                db.query(challengesQuery),
                db.query(playsQuery),
                db.query(mapsQuery)
            ]);

            res.json({
                totalUsers: parseInt(usersRes.rows[0].count),
                totalGames: parseInt(gamesRes.rows[0].count),
                totalReports: parseInt(reportsRes.rows[0].count),
                totalChallenges: parseInt(challengesRes.rows[0].count),
                totalPlays: parseInt(playsRes.rows[0].count),
                totalMaps: parseInt(mapsRes.rows[0].count)
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error fetching stats' });
        }
    }
};

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.use(verifyAdmin);

router.get('/stats', adminController.getDashboardStats);

router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);

router.get('/games', adminController.getAllGames);
router.post('/games', adminController.createGame);
router.get('/games/:id', adminController.getGameById);
router.put('/games/:id', adminController.updateGame);

router.get('/reports', adminController.getAllReports);
router.get('/reports/:id', adminController.getReportById);
router.put('/reports/:id', adminController.updateReport);

router.get('/options', adminController.getAllOptions);
router.put('/options', adminController.updateOption);

router.get('/challenges', adminController.getAllChallenges);
router.post('/challenges', adminController.createChallenge);
router.get('/challenges/:id', adminController.getChallengeById);
router.put('/challenges/:id', adminController.updateChallenge);
router.delete('/challenges/:id', adminController.deleteChallenge);

module.exports = router;

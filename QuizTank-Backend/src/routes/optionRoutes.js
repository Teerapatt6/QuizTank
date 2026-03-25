const express = require('express');
const router = express.Router();
const optionController = require('../controllers/optionController');

router.get('/', optionController.getOptions);

module.exports = router;

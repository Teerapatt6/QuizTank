const express = require('express');
const router = express.Router(); // Typo? express.Router() usually.
const MapController = require('../controllers/mapController'); // Assuming '../controllers/mapController' is correct

router.get('/', MapController.getAllMaps);
router.get('/:id', MapController.getMapById);
router.post('/', MapController.createMap);
router.put('/:id', MapController.updateMap);
router.delete('/:id', MapController.deleteMap);

module.exports = router;

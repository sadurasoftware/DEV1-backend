const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.post('/create', locationController.createLocation);
router.get('/get', locationController.getAllLocations);
router.get('/get/:id', locationController.getLocationsById);
router.put('/update/:id', locationController.updateLocation);
router.delete('/delete/:id', locationController.deleteLocation);
router.get('/by-state', locationController.getLocationsByState);
module.exports = router;
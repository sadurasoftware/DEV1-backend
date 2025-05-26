const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const validator = require('../validator/router-validator');

router.post('/create',validator.createLocationSchemaValidator, locationController.createLocation);
router.get('/get', locationController.getAllLocations);
router.get('/get/:id', validator.getLocationByIdSchemaValidator,locationController.getLocationsById);
router.put('/update/:id', validator.updateLocationSchemaParamsValidator,validator.updateLocationSchemaValidator,locationController.updateLocation);
router.delete('/delete/:id',validator.deleteLocationSchemaValidator,locationController.deleteLocation);
router.get('/by-state',validator.getLocationsByStateSchemaValidator, locationController.getLocationsByState);
module.exports = router;
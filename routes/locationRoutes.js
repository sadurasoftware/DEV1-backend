const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkPermission,checkRole}=require('../middlewares/checkRole');
const validator = require('../validator/router-validator');

router.post('/create',authenticateToken,checkRole('superadmin'),validator.createLocationSchemaValidator, locationController.createLocation);
router.get('/get', authenticateToken,checkRole('superadmin'),locationController.getAllLocations);
router.get('/get/:id',authenticateToken,checkRole('superadmin'), validator.getLocationByIdSchemaValidator,locationController.getLocationsById);
router.put('/update/:id',authenticateToken,checkRole('superadmin'), validator.updateLocationSchemaParamsValidator,validator.updateLocationSchemaValidator,locationController.updateLocation);
router.delete('/delete/:id',authenticateToken,checkRole('superadmin'),validator.deleteLocationSchemaValidator,locationController.deleteLocation);
router.get('/by-state',authenticateToken,checkRole('superadmin'),validator.getLocationsByStateSchemaValidator, locationController.getLocationsByState);
router.get('/by-country-state',authenticateToken,checkRole('superadmin'),validator.getLocationsByCountryAndStateSchemaValidator, locationController.getLocationsByCountryAndState);
module.exports = router;
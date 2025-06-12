const express = require('express');
const router = express.Router();
const stateController = require('../controllers/stateController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkPermission,checkRole}=require('../middlewares/checkRole');
const validator = require('../validator/router-validator');

router.post('/create',authenticateToken,checkRole('superadmin'), validator.createStateSchemaValidator, stateController.createState);
router.get('/get',authenticateToken,checkRole('superadmin'), stateController.getAllStates);
router.get('/get/:id', authenticateToken,checkRole('superadmin'),validator.getStateByIdSchemaValidator,stateController.getStateById);
router.get('/by-country',authenticateToken,checkRole('superadmin'), validator.getStatesByCountrySchemaValidator,stateController.getStatesByCountry)
router.put('/update/:id',authenticateToken,checkRole('superadmin'), validator.updateStateSchemaParamsValidator,validator.updateStateSchemaValidator,stateController.updateState);
router.delete('/delete/:id',authenticateToken,checkRole('superadmin'),validator.deleteStateSchemaValidator,stateController.deleteState);

module.exports = router;

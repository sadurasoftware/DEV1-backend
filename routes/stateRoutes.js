const express = require('express');
const router = express.Router();
const stateController = require('../controllers/stateController');
const validator = require('../validator/router-validator');

router.post('/create', validator.createStateSchemaValidator, stateController.createState);
router.get('/get', stateController.getAllStates);
router.get('/get/:id', validator.getStateByIdSchemaValidator,stateController.getStateById);
router.get('/by-country', validator.getStatesByCountrySchemaValidator,stateController.getStatesByCountry)
router.put('/update/:id', validator.updateStateSchemaParamsValidator,validator.updateStateSchemaValidator,stateController.updateState);
router.delete('/delete/:id',validator.deleteStateSchemaValidator,stateController.deleteState);

module.exports = router;

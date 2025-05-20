const express = require('express');
const router = express.Router();
const stateController = require('../controllers/stateController');

router.post('/create', stateController.createState);
router.get('/get', stateController.getAllStates);
router.get('/get/:id', stateController.getStateById);
router.get('/by-country', stateController.getStatesByCountry)
router.put('/update/:id', stateController.updateState);
router.delete('/delete/:id', stateController.deleteState);

module.exports = router;

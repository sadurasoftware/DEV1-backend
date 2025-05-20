const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');

router.post('/create', countryController.createCountry);
router.get('/get', countryController.getCountries);
router.get('/get/:id', countryController.getCountryById);
router.put('/update/:id', countryController.updateCountry);
router.delete('/delete/:id', countryController.deleteCountry);
router.get('/full', countryController.getAllCountriesWithHierarchy);
router.get('/getCountryWith-sates-branches/:id', countryController.getCountryWithStatesAndBranches);
module.exports = router;

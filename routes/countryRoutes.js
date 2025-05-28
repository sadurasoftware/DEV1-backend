const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');
const validator = require('../validator/router-validator');

router.post('/create',validator.createCountrySchemaValidator,countryController.createCountry);
router.get('/get', countryController.getCountries);
router.get('/get/:id',validator.getCountryByIdSchemaValidator,countryController.getCountryById);
router.put('/update/:id', validator.updateCountrySchemaParamsValidator,validator.updateCountrySchemaValidator,countryController.updateCountry);
router.delete('/delete/:id',validator.deleteCountrySchemaValidator,countryController.deleteCountry);
router.get('/full', countryController.getAllCountriesWithHierarchy);
router.get('/getCountryWith-sates-branches/:id',validator.getCountryWithStatesAndBranchesSchemaValidator,countryController.getCountryWithStatesAndBranches);
router.put('/update-all',validator.updateMasterDataSchemaValidator,countryController.updateAllMasterData)
module.exports = router;

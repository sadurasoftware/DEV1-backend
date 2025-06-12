const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkPermission,checkRole}=require('../middlewares/checkRole');
const validator = require('../validator/router-validator');

router.post('/create',authenticateToken,checkRole('superadmin'),validator.createCountrySchemaValidator,countryController.createCountry);
router.get('/get',authenticateToken,checkRole('superadmin'), countryController.getCountries);
router.get('/get/:id',authenticateToken,checkRole('superadmin'),validator.getCountryByIdSchemaValidator,countryController.getCountryById);
router.put('/update/:id', authenticateToken,checkRole('superadmin'),validator.updateCountrySchemaParamsValidator,validator.updateCountrySchemaValidator,countryController.updateCountry);
router.delete('/delete/:id',authenticateToken,checkRole('superadmin'),validator.deleteCountrySchemaValidator,countryController.deleteCountry);
router.get('/full',authenticateToken,checkRole('superadmin'), countryController.getAllCountriesWithHierarchy);
router.get('/getCountryWith-sates-branches/:id',authenticateToken,checkRole('superadmin'),validator.getCountryWithStatesAndBranchesSchemaValidator,countryController.getCountryWithStatesAndBranches);
router.put('/update-all',authenticateToken,checkRole('superadmin'),validator.updateMasterDataSchemaValidator,countryController.updateAllMasterData)
module.exports = router;

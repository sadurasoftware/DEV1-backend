const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designationController');
const validator = require('../validator/router-validator');

router.post('/create',validator.createDesignationSchemaValidator,designationController. createDesignation);
router.get('/get', designationController.getAllDesignations);
router.put('/update/:id',validator.updateDesignationSchemaParamsValidator,validator.updateDesignationSchemaValidator, designationController.updateDesignation);
router.get('/get/:id',validator.getDesignationByIdparamsValidator, designationController.getDesignationById);
router.delete('/delete/:id',validator.deleteDesignationSchemaValidator, designationController.deleteDesignation);
module.exports = router;

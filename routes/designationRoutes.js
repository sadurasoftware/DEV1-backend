const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designationController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkPermission,checkRole}=require('../middlewares/checkRole');
const validator = require('../validator/router-validator');

router.post('/create',authenticateToken,checkRole('superadmin'),validator.createDesignationSchemaValidator,designationController. createDesignation);
router.get('/get',authenticateToken,checkRole('superadmin'), designationController.getAllDesignations);
router.put('/update/:id',authenticateToken,checkRole('superadmin'),validator.updateDesignationSchemaParamsValidator,validator.updateDesignationSchemaValidator, designationController.updateDesignation);
router.get('/get/:id',authenticateToken,checkRole('superadmin'),validator.getDesignationByIdparamsValidator, designationController.getDesignationById);
router.delete('/delete/:id',authenticateToken,checkRole('superadmin'),validator.deleteDesignationSchemaValidator, designationController.deleteDesignation);
module.exports = router;

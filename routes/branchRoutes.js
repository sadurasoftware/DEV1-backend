const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchContorller');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkPermission,checkRole}=require('../middlewares/checkRole');
const validator = require('../validator/router-validator');

router.post('/create',authenticateToken,checkRole('superadmin'), validator.createBranchSchemaValidator,branchController.createBranch);
router.get('/get',authenticateToken,checkRole('superadmin'), branchController.getAllBranches);
router.get('/get/:id',authenticateToken,checkRole('superadmin'),validator.getBranchByIdSchemaValidator, branchController.getBranchById);
router.put('/update/:id',authenticateToken,checkRole('superadmin'),validator.updateBranchSchemaParamsValidator,validator.updateBranchSchemaValidator, branchController.updateBranch);
router.delete('/delete/:id',authenticateToken,checkRole('superadmin'),validator.deleteBranchSchemaValidator, branchController.deleteBranch);

module.exports = router;

const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchContorller');
const validator = require('../validator/router-validator');

router.post('/create', validator.createBranchSchemaValidator,branchController.createBranch);
router.get('/get', branchController.getAllBranches);
router.get('/get/:id',validator.getBranchByIdSchemaValidator, branchController.getBranchById);
router.put('/update/:id',validator.updateBranchSchemaParamsValidator,validator.updateBranchSchemaValidator, branchController.updateBranch);
router.delete('/delete/:id',validator.deleteBranchSchemaValidator, branchController.deleteBranch);

module.exports = router;

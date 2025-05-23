const express=require('express');
const router=express.Router();
const roleController=require('../controllers/roleController');
const validator=require('../validator/router-validator');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkRole}=require('../middlewares/checkRole')

router.post('/create',authenticateToken,checkRole('superadmin'),validator.roleValidator,roleController.createRole);
router.get('/get',roleController.getAllRoles);
router.get('/get/:id',authenticateToken,checkRole('superadmin'),validator.getRoleByIdvalidator,roleController.getRollById);
router.put('/update/:id',authenticateToken,checkRole('superadmin'), roleController.updateRole);

module.exports=router;
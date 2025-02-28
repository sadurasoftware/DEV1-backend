const express=require('express');
const router=express.Router();
const PermissionController=require('../controllers/permissionController');
const validator=require('../validator/router-validator');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkRole}=require('../middlewares/checkRole')

router.post('/create',authenticateToken,checkRole('superadmin'),validator.permissionValidator, PermissionController.createPermission);
router.get('/get',authenticateToken,checkRole('superadmin'),PermissionController.getPermission);
router.get('/get/:id',authenticateToken,checkRole('superadmin'),validator.getPermissionValidator,PermissionController.getPermissionById);

module.exports=router;
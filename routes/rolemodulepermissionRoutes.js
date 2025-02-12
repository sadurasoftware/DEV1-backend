const express=require('express');
const RoleModulePermissionController=require('../controllers/RoleModulePermissionController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkRole}=require('../middlewares/checkRole');
const router=express.Router();

router.post('/create',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.createRoleModulePermission);
router.post('/rolemodules',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.getModulesForRole);
router.get('/modulespermissionsByRole',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.getModulesAndPermissionsByRole);
router.post('/addPermissionsToRole',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.addPermissionsToRole);
router.delete('/removePermissionsFromRole',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.removePermissionsFromRole);
router.delete('/delete-module',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.deleteModule);
router.delete('/delete-permission',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.deletePermission);
module.exports=router;

const express=require('express');
const RoleModulePermissionController = require('../controllers/RoleModulePermissionController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkRole}=require('../middlewares/checkRole');
const validator=require('../validator/router-validator');
const router=express.Router();
   
router.post('/create',authenticateToken,checkRole('superadmin'),validator.createRoleModulePermissionValidator,RoleModulePermissionController.createRoleModulePermission);
router.post('/rolemodules',authenticateToken,checkRole('superadmin'),validator.getModulesForRoleValidator,RoleModulePermissionController.getModulesForRole);
router.get('/modulespermissionsByRole',authenticateToken,checkRole('superadmin'),validator.getModulesAndPermissionsByRoleValidator,RoleModulePermissionController.getModulesAndPermissionsByRole);

router.delete('/delete-module/:moduleId',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.deleteModule);
router.delete('/delete-permission/:permissionId',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.deletePermission);
router.put('/update-permission',authenticateToken,checkRole('superadmin'),validator.updatePermissionSchemaValidator,RoleModulePermissionController.updatePermission);
router.put('/update-module',authenticateToken,checkRole('superadmin'),validator.updateModuleSchemaValidator,RoleModulePermissionController.updateModule);
router.delete('/delete-role',authenticateToken,checkRole('superadmin'),validator.deleteRoleValidator,RoleModulePermissionController.deleteRole);

module.exports=router;

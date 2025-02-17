const express=require('express');
const RoleModulePermissionController = require('../controllers/RoleModulePermissionController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkRole}=require('../middlewares/checkRole');
const validator=require('../validator/router-validator');
const router=express.Router();

router.post('/create',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.createRoleModulePermission);
router.post('/rolemodules',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.getModulesForRole);
router.get('/modulespermissionsByRole',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.getModulesAndPermissionsByRole);
router.put('/update-modulespermissionsByRole',authenticateToken,checkRole('superadmin'),RoleModulePermissionController.updateModulesForRole);
router.post('/addPermissionsToRole',authenticateToken,checkRole('superadmin'),validator.addModulePermissionValidator,RoleModulePermissionController.addPermissionsToRole);
router.delete('/removePermissionsFromRole',authenticateToken,checkRole('superadmin'),validator.removePermissionsSchemaValidator,RoleModulePermissionController.removePermissionsFromRole);
router.delete('/delete-module',authenticateToken,checkRole('superadmin'),validator.deleteModuleSchemaValidator,RoleModulePermissionController.deleteModule);
router.delete('/delete-permission',authenticateToken,checkRole('superadmin'),validator.deletePermissionSchemaValidator,RoleModulePermissionController.deletePermission);
router.put('/update-permission',validator.updatePermissionSchemaValidator,RoleModulePermissionController.updatePermission);
router.put('/update-module',validator.updateModuleSchemaValidator,RoleModulePermissionController.updateModule);
module.exports=router;

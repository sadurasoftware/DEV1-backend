const express=require('express');
const RoleModulePermissionController = require('../controllers/RoleModulePermissionController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkRole}=require('../middlewares/checkRole');
const validator=require('../validator/router-validator');
const router=express.Router();
   
router.post('/create',authenticateToken,checkRole('superadmin'),validator.createRoleModulePermissionValidator,RoleModulePermissionController.createRoleModulePermission);
router.post('/rolemodules',authenticateToken,checkRole('superadmin'),validator.getModulesForRoleValidator,RoleModulePermissionController.getModulesForRole);
router.get('/modulespermissionsByRole',authenticateToken,checkRole('superadmin'),validator.getModulesAndPermissionsByRoleValidator,RoleModulePermissionController.getModulesAndPermissionsByRole);

router.delete('/delete-module',authenticateToken,checkRole('superadmin'),validator.deleteModuleSchemaValidator,RoleModulePermissionController.deleteModule);
router.delete('/delete-permission',authenticateToken,checkRole('superadmin'),validator.deletePermissionSchemaValidator,RoleModulePermissionController.deletePermission);
router.put('/update-permission',validator.updatePermissionSchemaValidator,RoleModulePermissionController.updatePermission);
router.put('/update-module',validator.updateModuleSchemaValidator,RoleModulePermissionController.updateModule);
module.exports=router;

const express=require('express');
const router=express.Router();
const RolePermissionController=require('../controllers/RolePermissionController');

router.post('/create',RolePermissionController.createRolePermission);
router.get('/get',RolePermissionController.getRolePermission);
router.get('/get/:id',RolePermissionController.getRolePermissionById);
router.put('/update',RolePermissionController.updateRolePermission);
router.delete('/delete/:id',RolePermissionController.deleteRolePermission);
router.get('/:roleId',RolePermissionController.getRoleForPermissions)
module.exports=router;

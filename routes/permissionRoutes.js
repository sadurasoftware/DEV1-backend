const express=require('express');
const router=express.Router();
const PermissionController=require('../controllers/permissionController');

router.post('/create',PermissionController.createPermission);
router.get('/get',PermissionController.getPermission);
router.get('/get/:id',PermissionController.getPermissionById);
router.put('/update/:id',PermissionController.updatePermission);
router.delete('/delete/:id',PermissionController.deletePermission);

module.exports=router;
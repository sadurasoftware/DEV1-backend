const express=require('express');
const router=express.Router();
const RoleModuleController=require('../controllers/roleModuleController');

router.post('/create', RoleModuleController.createRoleModule);
router.get('/get', RoleModuleController.getRoleModule);
router.get('/get/:id', RoleModuleController.getRoleModuleById);
router.put('/update', RoleModuleController.updateRoleModule);
router.delete('/delete/:id', RoleModuleController.deleteRoleModule);
router.get('/:roleId', RoleModuleController.getRoleForModule)

module.exports=router;
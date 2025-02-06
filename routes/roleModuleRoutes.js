const express=require('express');
const router=express.Router();
const RoleModuleController=require('../controllers/roleModuleController');

router.post('/create', RoleModuleController.createRoleModule);
router.get('/get', RoleModuleController.getRoleModule);

module.exports=router;
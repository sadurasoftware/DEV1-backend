const express=require('express');
const router=express.Router();
const ModuleController=require('../controllers/moduleController');
const validator=require('../validator/router-validator');

router.post('/create',validator.moduleValidator,ModuleController.createModule);
router.get('/get', ModuleController.getModule);
router.get('/get/:id', ModuleController.getModuleById);

module.exports=router;
const express=require('express');
const router=express.Router();
const ModuleController=require('../controllers/moduleController');
const validator=require('../validator/router-validator');

router.post('/create',validator.moduleValidator,ModuleController.createModule);
router.get('/get', ModuleController.getModule);
router.get('/get/:id', ModuleController.getModuleById);
router.put('/update/:id',ModuleController.updateModule);
router.delete('/delete/:id',ModuleController.deleteModule);

module.exports=router;
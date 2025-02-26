const express=require('express');
const router=express.Router();
const ModuleController=require('../controllers/moduleController');
const validator=require('../validator/router-validator');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkRole}=require('../middlewares/checkRole')

router.post('/create',authenticateToken,checkRole('superadmin'),validator.moduleValidator,ModuleController.createModule);
router.get('/get',authenticateToken,checkRole('superadmin'),ModuleController.getModule);
router.get('/get/:id',authenticateToken,checkRole('superadmin'),validator.getModulesValidator, ModuleController.getModuleById);

module.exports=router;
const express=require('express');
const router=express.Router();
const departmentController=require('../controllers/departmentController');
const validator=require('../validator/router-validator');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkRole}=require('../middlewares/checkRole')

router.post('/create',authenticateToken,checkRole('superadmin'),validator.createDepartmentSchemaValidator,departmentController.createDepartment);
router.get('/get',authenticateToken,checkRole('superadmin'),departmentController.getAllDepartments);
router.get('/get/:id',authenticateToken,checkRole('superadmin'),validator.getDepartmentByIdSchemaValidator,departmentController.getDepartmentById);
router.put('/update/:id',authenticateToken,checkRole('superadmin'),validator.updateDepartmentSchemaValidator, departmentController.updateDepartment);
router.delete('/delete/:id',authenticateToken,checkRole('superadmin'), validator.deleteDepartmentSchemaValidator,departmentController.deleteDepartment);

module.exports=router;
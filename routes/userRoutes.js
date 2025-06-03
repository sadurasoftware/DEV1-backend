const express=require('express');
const userController=require('../controllers/userController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkPermission,checkRole}=require('../middlewares/checkRole');
const validator=require('../validator/router-validator')
const router=express.Router();

router.post('/create',authenticateToken,checkPermission("User","create"),userController.createUser)
router.get('/users', userController.getUsers)
router.get('/admins',authenticateToken,checkRole('superadmin','admin'), userController.getAdmins)
router.get('/', authenticateToken,checkRole('superadmin','admin'),userController.getUsers)
router.get('/:id', userController.getUser);
router.get('/:id', userController.fetchUserData);
router.put('/update/:id',authenticateToken,checkPermission("User","write"),validator.updateUservalidator,userController.updateUser);
router.get('/:id', userController.getAdmin);
router.get('/:id', userController.fetchAdminData);
router.put('/:id', authenticateToken,checkRole('admin'),userController.updateAdmin);
router.get('/view/:id',authenticateToken,checkPermission("User","read"),validator.viewUservalidator,userController.viewUser)
router.delete('/users/:id',authenticateToken,checkPermission("User","delete"),validator.deleteUservalidator,userController.deleteUser);

module.exports=router;
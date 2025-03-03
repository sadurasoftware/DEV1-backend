const express=require('express');
const userController=require('../controllers/userController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const {checkPermission}=require('../middlewares/checkRole');
const validator=require('../validator/router-validator')
const router=express.Router();

router.post('/create',authenticateToken,checkPermission("User","create"),validator.createUservalidator,userController.createUser)
router.get('/users', userController.getUsers)
router.get('/admins', userController.getAdmins)
router.get('/', userController.getUsers)
router.get('/:id', userController.getUser);
router.get('/:id', userController.fetchUserData);
router.put('/:id',authenticateToken,checkPermission("User","update"),userController.updateUser);
router.get('/:id', userController.getAdmin);
router.get('/:id', userController.fetchAdminData);
router.put('/:id', userController.updateAdmin);
router.delete('/:id',userController.deleteuser)
module.exports=router;
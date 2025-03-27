const { User } = require('../models');
const { Role } = require('../models');
const { Op } = require('sequelize');
const {Module,Permission,RoleModulePermission,Department}=require('../models');
const bcryptHelper = require('../utils/bcryptHelper');
const jwtHelper = require('../utils/jwtHelper');
const logger = require('../config/logger');
const emailHelper = require('../utils/emailHelper');

const createUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password, terms, departmentId,role } = req.body;
    console.log(req.body); 

    // if (password !== confirmPassword) {
    //   logger.warn(`Passwords do not match during registration: ${email}`);
    //   return res.status(400).json({ message: 'Passwords do not match' });
    // }
    
    if (!terms) {
      logger.warn(`User did not accept terms during registration: ${email}`);
      return res.status(400).json({ message: 'You must accept the terms and conditions to register' });
    }

    logger.info(`Registering user: ${email}`);
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`Registration failed. User already exists: ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }
    const roleData = await Role.findOne({ where: { name: role } });
    if (!roleData) {
      logger.warn(`Invalid role provided during registration: ${role}`);
      return res.status(400).json({ message: 'Invalid role' });
    }
    const hashedPassword = await bcryptHelper.hashPassword(password);
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      isVerified: false,
      roleId: roleData.id,
      departmentId,
      terms,
    });
    const tokenPayload = { id: newUser.id, email: newUser.email, firstname: newUser.firstname, lastname: newUser.lastname };
    const token = jwtHelper.generateToken(tokenPayload, process.env.JWT_SECRET, '10m');
    const verificationUrl = `${process.env.VERIFICATION_URL}/verify-email/${token}`;
    await emailHelper.verificationEmail(email, verificationUrl, firstname);
    logger.info(`User registered successfully: ${email}`);
    return res.status(201).json({
      message: 'User created successfully. Please verify your email.',
      user: { id: newUser.id, firstname: newUser.firstname, email: newUser.email, token },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};
async function getUser(req, res) {
  try {
    const {id}=req.params;
    const user = await User.findByPk(id);
    logger.info(`User fetched successfully: ${id}`);
    if (!user) {
      logger.warn(`User not found: ${id}`);
      return res.status(404).json({ message: 'User not found' });
    }
    logger.info(`User fetched successfully: ${id}`);
    return res.status(200).json({message: 'User fetched successfully',userData:user });
  } catch (error) {
    logger.error(`Error fetching user: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function fetchUserData(req, res) {
  try {
    const {id} = req.params; 
    const user = await User.findByPk(id, {
      include: { model: Role } 
    });
    if (!user) {
      logger.warn(`User not found: ${id}`);
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({userData:user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { firstname, lastname, email, departmentId, role: roleName } = req.body;
    logger.info(`User ${req.user.id} attempting to update user: ${id}`);

    const user = await User.findByPk(id);
    if (!user) {
      logger.warn(`User not found: ${id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedRoles = ['superadmin', 'admin'];
    const userRole = await Role.findByPk(req.user.roleId); 
    if (!allowedRoles.includes(userRole.name) && req.user.id !== parseInt(id)) {
      logger.warn(`Unauthorized attempt by user ${req.user.id} to update user ${id}`);
      return res.status(403).json({ message: 'You are not authorized to update this user.' });
    }

    if (roleName) {
      const roleData = await Role.findOne({ where: { name: roleName } });
      if (!roleData) {
        logger.warn(`Invalid role provided during update: ${roleName}`);
        return res.status(400).json({ message: 'Invalid role' });
      }
      user.roleId = roleData.id;
    }

    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.email = email || user.email;
    user.departmentId = departmentId || user.departmentId;

    await user.save();

    logger.info(`User ${id} updated successfully by user ${req.user.id}`);
    return res.status(200).json({ message: 'User updated successfully', userData: user });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
}

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, departmentId } = req.query;
    const whereClause = { roleId: 3 };
    if (search) {
      whereClause[Op.or] = [
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }
    const offset = (page - 1) * limit;
    const { rows: users, count } = await User.findAndCountAll({
      where: whereClause,
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'] },
      ],
      attributes: ['id', 'firstname', 'lastname', 'email'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    logger.info('Users fetched successfully');
    return res.status(200).json({
      message: 'Users fetched successfully',
      totalUsers: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      users,
    });

  } catch (err) {
    logger.error(`Error fetching users: ${err.message}`);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
};


const getAdmins=async(req,res)=>{
  try{
    const admins = await User.findAll({
      where: {
        roleId: 2
      }
    });
    logger.info(`Admins fetched successfully`);
     res.status(200).json(admins);
  }catch(err){
    logger.error(`Error fetching admins: ${err.message}`);
    console.log(err);
    res.status(500).json({message:"Server Error",error:err.message})

  }
}

async function getAdmin(req, res) {
  try {
    const {id}=req.params;
    const user = await User.findByPk(id);
    if (!user) {
      logger.warn(`Admin not found: ${id}`);
      return res.status(404).json({ message: 'Admin not found' });
    }
    return res.status(200).json({userData:user});
  } catch (error) {
    logger.error(`Error fetching admin: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function fetchAdminData(req, res) {
  try {
    const {id} = req.params; 
    const user = await User.findByPk(id, {
      include: { model: Role } 
    });
 
    if (!user) {
      logger.warn(`User not found: ${id}`);
      return res.status(404).json({ message: 'User not found' });
    }
    logger.info(`User fetched successfully: ${id}`);
    return res.status(200).json({userData:user});
  } catch (error) {
    logger.error(`Error fetching user: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
}


async function updateAdmin(req, res) {
  try {
    const {id} = req.params;  
    const {firstname, email} = req.body;  
    
    const user = await User.findByPk(id);
    if (!user) {
      logger.warn(`Admin not found: ${id}`);
      return res.status(404).json({ message: 'Admin not found' });
    }
    user.firstname = firstname;
    user.email = email;
    await user.save();
    logger.info(`Admin updated successfully: ${id}`);
    return res.status(200).json({message: 'Admin updated successfully',userData:user });
  } catch (error) {
    logger.error(`Error updating admin: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
}
const viewUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; 
    logger.info(`User ${userId} attempting to view user: ${id}`);
    const user = await User.findByPk(id, {
      attributes: ["id", "firstname", "lastname", "email", "departmentId", "roleId"],
      include: [
        { model: Role, as: "role", attributes: ["name"] },
        { model: Department, as: "department", attributes: ["name"] },
      ],
    });

    if (!user) {
      logger.warn(`User not found: ${id}`);
      return res.status(404).json({ message: "User not found" });
    }

    logger.info(`User ${id} viewed successfully by user ${userId}`);
    return res.status(200).json({
      message: "User details fetched successfully",
      userData: user,
    });

  } catch (error) {
    logger.error(`Error viewing user: ${error.message}`);
    return res.status(500).json({ message: "Server error" });
  }
};
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    logger.info(`User ${req.user.id} attempting to delete user: ${id}`);

    const user = await User.findByPk(id);
    if (!user) {
      logger.warn(`User not found: ${id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const module = await Module.findOne({ where: { name: 'User' } });
    if (!module) {
      logger.warn('Module not found');
      return res.status(400).json({ message: 'Module not found' });
    }

    const permission = await Permission.findOne({ where: { name: 'delete' } });
    if (!permission) {
      logger.warn('Permission not found');
      return res.status(400).json({ message: 'Permission not found' });
    }

    const rolePermission = await RoleModulePermission.findOne({
      where: {
        roleId: req.user.roleId,
        moduleId: module.id,
        permissionId: permission.id,
        status: true,
      },
    });

    if (!rolePermission) {
      logger.warn(`Unauthorized attempt by user ${req.user.id} to delete user ${id}`);
      return res.status(403).json({ message: 'You are not authorized to delete this user.' });
    }

    await user.destroy();

    logger.info(`User ${id} deleted successfully by user ${req.user.id}`);
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
}
module.exports = {
  createUser,
  getUser,
  fetchUserData,
  updateUser,
  getUsers,
  getAdmins,
  getAdmin,
  fetchAdminData,
  updateAdmin,
  viewUser,
  deleteUser
};

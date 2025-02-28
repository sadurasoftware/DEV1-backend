const { User } = require('../models');
const { Role } = require('../models');
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
    const { firstname, lastname, email, departmentId, role } = req.body;
    logger.info(`Updating user: ${id}`);
    const user = await User.findByPk(id);
    if (!user) {
      logger.warn(`User not found: ${id}`);
      return res.status(404).json({ message: 'User not found' });
    }
    const roleData = await Role.findOne({ where: { name: role } });
    if (!roleData) {
      logger.warn(`Invalid role provided during update: ${role}`);
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.email = email || user.email;
    user.departmentId = departmentId || user.departmentId;
    user.roleId = roleData.id || user.roleId;

    await user.save();

    return res.status(200).json({message: 'User updated successfully',userData: user,});
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

const getUsers=async(req,res)=>{
  try{
    const users = await User.findAll({
      where: {
        roleId: 3
      }
    });
    logger.info(`Users fetched successfully`);
     res.status(200).json(users);
  }catch(err){
    console.log(err);
    res.status(500).json({message:"Server Error",error:err.message})

  }
}

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
const deleteuser=async(req,res)=>{
  try{
    const {id}=req.params;
    const user=await User.findByPk(id);
    if(!user){
      logger.warn(`User not found: ${id}`);
      return res.status(404).json({ message: 'User not found' });
    }
    await user.destroy();
    logger.info(`User deleted successfully: ${id}`);
    return res.status(200).json({ message: 'User deleted successfully' });
  }catch(error){
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
  deleteuser
};

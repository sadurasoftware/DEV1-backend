const { User } = require('../models');


async function getUser(req, res) {
  try {
    const {id}=req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({
      userData:user
    });
  } catch (error) {
    console.error(error);
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
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      userData:user
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateUser(req, res) {
  try {
    const {id} = req.params;  
    const {username, email} = req.body;  
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username;
    user.email = email;
    await user.save();

    return res.status(200).json({
      message: 'User updated successfully',
      userData:user
    });
  } catch (error) {
    console.error('Error updating user:', error);
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
     res.status(200).json(admins);
  }catch(err){
    console.log(err);
    res.status(500).json({message:"Server Error",error:err.message})

  }
}


async function getAdmin(req, res) {
  try {
    const {id}=req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    return res.status(200).json({
      userData:user
    });
  } catch (error) {
    console.error(error);
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
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      userData:user 
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}


async function updateAdmin(req, res) {
  try {
    const {id} = req.params;  
    const {username, email} = req.body;  
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    user.username = username;
    user.email = email;
    await user.save();

    return res.status(200).json({
      message: 'Admin updated successfully',
      userData:user 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}


module.exports = {
  getUser,
  fetchUserData,
  updateUser,
  getUsers,
  getAdmins,
  getAdmin,
  fetchAdminData,
  updateAdmin,
};

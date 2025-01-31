const { User } = require('../models');


async function getUser(req, res) {
  try {
    const {id}=req.params;
    console.log("userid:" + id)
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
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
      user: { username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}



const getUsers=async(req,res)=>{
  try{
     const user=await User.findAll();
     res.status(200).json(user);
  }catch(err){
    console.log(err);
    res.status(500).json({message:"Server Error",error:err.message})

  }
}



async function getAdmin(req, res) {
  try {
    const {id}=req.params;
    const user = await User.findByPk(id);

        const roleData = await Role.findOne({ where: { id: user.roleId } });
        if (!roleData) {
        logger.warn(`Invalid role provided during registration: ${user.roleId}`);
        return res.status(400).json({ message: 'Invalid role' });
      }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({
      username: user.username,
      email: user.email,
      role: roleData.name,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}


module.exports = {
  getUser,
  updateUser,
  getUsers,
  getAdmin,
};

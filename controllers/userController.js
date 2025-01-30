const { User } = require('../models');

async function getUser(req, res) {
  try {
    const id=req.params
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


module.exports = {
  getUser,
  getUsers,
  getAdmins,
};

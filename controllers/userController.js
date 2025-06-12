const {} = require('../models');
const { Op } = require('sequelize');
const {Role,User,Department,Ticket,TicketAttachment,Comment,CommentAttachment,TicketHistory} = require('../models');
const bcryptHelper = require('../utils/bcryptHelper');
const jwtHelper = require('../utils/jwtHelper');
const emailHelper = require('../utils/emailHelper');
const { deleteFileFromS3, deleteS3Folder} = require('../utils/fileHelper');
const { Designation,Country,State,Location,Branch } = require('../models');
const UserInfo=require('../models/UserInfo');
const { createProfilePictureUpload } =require('../utils/fileHelper');
const createUser = async (req, res) => {
  try {
    const createdBy = req.user.id;
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      profilePicture,
      gender,
      blood_group,
      countryName,
      stateName,
      locationName,
      branchName,
      departmentName,
      designationName,
      roleName = 'user',
      terms
    } = req.body;
    
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    const existingPhone = await UserInfo.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const role = await Role.findOne({ where: { name: roleName } });
    const country = await Country.findOne({ where: { name: countryName } });
    const state = await State.findOne({ where: { name: stateName } });
    const location= await Location.findOne({ where: { name: locationName } });
    const branch = await Branch.findOne({ where: { name: branchName } });
    const department = await Department.findOne({ where: { name: departmentName } });
    const designation = await Designation.findOne({ where: { name: designationName } });

    if (!role) return res.status(400).json({ message: 'Invalid role name' });
    if (!country) return res.status(400).json({ message: 'Invalid country name' });
    if (!state) return res.status(400).json({ message: 'Invalid state name' });
    if (!location) return res.status(400).json({ message: 'Invalid location name' });
    if (!branch) return res.status(400).json({ message: 'Invalid branch name' });
    if (!department) return res.status(400).json({ message: 'Invalid department name' });
    if (!designation) return res.status(400).json({ message: 'Invalid designation name' });
    
    const hashedPassword = await bcryptHelper.hashPassword(password);
    const newUser = await User.create({
      firstname: firstName,
      lastname: lastName,
      email,
      password: hashedPassword,
      roleId: role.id,
      departmentId: department.id,
      isVerified: false,
      isActive: true,
      last_LoggedIn: null,
      terms,
    });
    await UserInfo.create({
      userId: newUser.id,
      phone,
      address,
      profilePicture:null,
      gender,
      blood_group,
      country_id: country.id,
      state_id: state.id,
      location_id: location.id,
      branch_id: branch.id,
      designationId: designation.id,
      createdBy,
      updatedBy: createdBy,
      terms,
      isVerified: false,
    });

    const tokenPayload = { id: newUser.id, email: newUser.email };
    
    const token = jwtHelper.generateToken(tokenPayload, process.env.JWT_SECRET, '1d');

    const loginUrl = `${process.env.USER_LOGIN_URL}/verify-email/${token}`;
    await emailHelper.sendUserWelcomeEmail(
      newUser.email,
      firstName,
      lastName,
      email,
      password, 
      loginUrl
    );

    return res.status(201).json({
      message: 'User created. Verification email sent.',
      user: { id: newUser.id, email: newUser.email }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const firstName = user.firstname;
    const lastName = user.lastname;

    const dynamicUpload = createProfilePictureUpload(firstName, lastName).single('profilePicture');

    dynamicUpload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'No profile picture uploaded' });
      }
      const profilePictureUrl = req.file.location;
      await UserInfo.update(
        { profilePicture: profilePictureUrl },
        { where: { userId } }
      );
      return res.status(200).json({
        message: 'Profile picture uploaded successfully',
        url: profilePictureUrl,
      });
    });
  } catch (error) {
    console.error('uploadProfilePicture error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
async function getUser(req, res) {
  try {
    const {id}=req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({message: 'User fetched successfully',userData:user });
  } catch (error) {
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
    return res.status(200).json({userData:user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({ message: 'User status updated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { firstname, lastname, email, departmentId, role: roleName } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const allowedRoles = ['superadmin', 'admin'];
    const userRole = await Role.findByPk(req.user.roleId); 
    if (!allowedRoles.includes(userRole.name) && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'You are not authorized to update this user.' });
    }

    if (roleName) {
      const roleData = await Role.findOne({ where: { name: roleName } });
      if (!roleData) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      user.roleId = roleData.id;
    }
    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.email = email || user.email;
    user.departmentId = departmentId || user.departmentId;

    await user.save();

    return res.status(200).json({ message: 'User updated successfully', userData: user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, departmentName } = req.query;

    const whereClause = { roleId: 3 };
    const departmentWhere = {};
    if (search) {
      whereClause[Op.or] = [
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (departmentName) {
      departmentWhere.name = { [Op.like]: `%${departmentName}%` };
    }

    const offset = (page - 1) * limit;

    const { rows: users, count } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
          where: Object.keys(departmentWhere).length ? departmentWhere : undefined,
        }
      ],
      attributes: ['id', 'firstname', 'lastname', 'email'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      message: 'Users fetched successfully',
      totalUsers: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      users,
    });

  } catch (err) {
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

const getAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, departmentName } = req.query;

    const whereClause = { roleId: 2 };
    const departmentWhere = {};
    if (search) {
      whereClause[Op.or] = [
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (departmentName) {
      departmentWhere.name = { [Op.like]: `%${departmentName}%` };
    }

    const offset = (page - 1) * limit;

    const { rows: admins, count } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
          where: Object.keys(departmentWhere).length ? departmentWhere : undefined,
        }
      ],
      attributes: ['id', 'firstname', 'lastname', 'email'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      message: 'Users fetched successfully',
      totalAdmins: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      admins,
    });

  } catch (err) {
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

async function getAdmin(req, res) {
  try {
    const {id}=req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    return res.status(200).json({userData:user});
  } catch (error) {
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
    return res.status(200).json({userData:user});
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}
async function updateAdmin(req, res) {
  try {
    const {id} = req.params;  
    const {firstname, email} = req.body;  
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    user.firstname = firstname;
    user.email = email;
    await user.save();
    return res.status(200).json({message: 'Admin updated successfully',userData:user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}
const viewUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; 
    const user = await User.findByPk(id, {
      attributes: ["id", "firstname", "lastname", "email", "departmentId", "roleId"],
      include: [
        { model: Role, as: "role", attributes: ["name"] },
        { model: Department, as: "department", attributes: ["name"] },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "User details fetched successfully",
      userData: user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const tickets = await Ticket.findAll({ where: { createdBy: id } });

    for (const ticket of tickets) {
      const ticketAttachments = await TicketAttachment.findAll({ where: { ticketId: ticket.id } });
      for (const attachment of ticketAttachments) {
        const url = new URL(attachment.url);
        const key = decodeURIComponent(url.pathname.substring(1));
        await deleteFileFromS3(key);
      }
      await TicketAttachment.destroy({ where: { ticketId: ticket.id } });
      const comments = await Comment.findAll({ where: { ticketId: ticket.id } });
      for (const comment of comments) {
        const commentAttachments = await CommentAttachment.findAll({ where: { commentId: comment.id } });
        for (const attachment of commentAttachments) {
          const url = new URL(attachment.url);
          const key = decodeURIComponent(url.pathname.substring(1));
          await deleteFileFromS3(key);
        }
        await CommentAttachment.destroy({ where: { commentId: comment.id } });
      }
      await Comment.destroy({ where: { ticketId: ticket.id } });

      await TicketHistory.destroy({ where: { ticketId: ticket.id } });

      await deleteS3Folder(ticket.id);
      
      await ticket.destroy();
    }

    const userComments = await Comment.findAll({ where: { updatedBy: id } });
    for (const comment of userComments) {
      const commentAttachments = await CommentAttachment.findAll({ where: { commentId: comment.id } });
      for (const attachment of commentAttachments) {
        const url = new URL(attachment.url);
        const key = decodeURIComponent(url.pathname.substring(1));
        await deleteFileFromS3(key);
      }
      await CommentAttachment.destroy({ where: { commentId: comment.id } });
    }
    await Comment.destroy({ where: { updatedBy: id } });
    await user.destroy();
    return res.status(200).json({ message: 'User and all related data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
const getActiveUsers = async (req, res) => {
  try {
    const {page = 1,limit = 10,search = '',departmentId} = req.query;
    const offset = (page - 1) * limit;
    const whereUser = {
      isActive: true,
      [Op.or]: [
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    };
    const whereUserInfo = {};
    if (departmentId) whereUserInfo.departmentId = departmentId;

    const { count, rows } = await User.findAndCountAll({
      where: whereUser,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ['id', 'firstname', 'lastname', 'email', 'departmentId','isVerified'], 
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name']
            }
          ]
        }
    );
    res.status(200).json({
      totalUsers: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      users: rows
    });
  } catch (error) {
    console.error('Error in getActiveUsers:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
module.exports = {
  createUser,
  uploadProfilePicture,
  getActiveUsers,
  getUser,
  fetchUserData,
  updateUserStatus,
  updateUser,
  getUsers,
  getAdmins,
  getAdmin,
  fetchAdminData,
  updateAdmin,
  viewUser,
  deleteUser
};

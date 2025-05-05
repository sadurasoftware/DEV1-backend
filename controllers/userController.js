const {} = require('../models');
const { Op } = require('sequelize');
const {Role,User,Department,Ticket,TicketAttachment,Comment,CommentAttachment,TicketHistory} = require('../models');
const bcryptHelper = require('../utils/bcryptHelper');
const jwtHelper = require('../utils/jwtHelper');
const emailHelper = require('../utils/emailHelper');
const { deleteFileFromS3, deleteS3Folder } = require('../utils/fileHelper');
const createUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password, terms, departmentId,role } = req.body;
    // if (password !== confirmPassword) {
    //   logger.warn(`Passwords do not match during registration: ${email}`);
    //   return res.status(400).json({ message: 'Passwords do not match' });
    // }
    if (!terms) {
      return res.status(400).json({ message: 'You must accept the terms and conditions to register' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const roleName = role || 'user';
    const roleData = await Role.findOne({ where: { name: roleName } });
    if (!roleData) {
      return res.status(400).json({ message: `Invalid role: ${roleName}` });
    }
    let finalDepartmentId = departmentId;
    if (!departmentId) {
      const generalDepartment = await Department.findOne({ where: { name: 'General department' } });
      if (!generalDepartment) {
        return res.status(400).json({ message: 'Default department "General" not found' });
      }
      finalDepartmentId = generalDepartment.id;
    }
    const hashedPassword = await bcryptHelper.hashPassword(password);
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      isVerified: false,
      roleId: roleData.id,
      departmentId: finalDepartmentId,
      terms,
    });
    const tokenPayload = { id: newUser.id, email: newUser.email, firstname: newUser.firstname, lastname: newUser.lastname };
    const token = jwtHelper.generateToken(tokenPayload, process.env.JWT_SECRET, '10m');
    const verificationUrl = `${process.env.VERIFICATION_URL}/verify-email/${token}`;
    await emailHelper.verificationEmail(email, verificationUrl, firstname);
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

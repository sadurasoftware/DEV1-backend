const Ticket = require('../models/Ticket');
const logger = require('../config/logger');
const Category = require('../models/Category');
const User = require('../models/User');
const Department = require('../models/Department');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');
const emailHelper = require('../utils/emailHelper');
const fs = require('fs');
const path = require('path');
const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category} = req.body;
    const createdBy = req.user.id; 
    const ticketId = req.ticketId; 

    if (!title || !description || !priority || !category) {
      logger.warn('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    const categoryData = await Category.findOne({ where: { name: category } });
    if (!categoryData) {
      logger.warn(`Category not found: ${category}`);
      return res.status(404).json({ message: 'Category not found' });
    }

    const attachment = req.file ? req.file.filename : null;
    const ticket = await Ticket.create({
      id: ticketId,
      title,
      description,
      attachment,
      priority,
      categoryId: categoryData.id,
      createdBy,
      assignedTo: null
    });

    logger.info(`Ticket created successfully: ${ticketId}`);
    return res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    logger.error(`Error creating ticket: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body; 
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const supportDept = await Department.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.fn('TRIM', Sequelize.col('name'))),
        'support team department'
      )
    });
    if (!supportDept) {
      return res.status(404).json({ message: 'Support Team department not found' });
    }
    const assignedUser = await User.findOne({
      where: {
        id: assignedTo,
        departmentId: supportDept.id
      }
    });

    if (!assignedUser) {
      return res.status(404).json({ message: 'Assigned user not found in Support Team' });
    }
    ticket.assignedTo = assignedUser.id;
    await ticket.save();
    const ticketUrl = `${process.env.TICKET_ASSIGN_URL}/assigned-ticket/${ticket.id}`
    await emailHelper.ticketAssignedEmail(assignedUser.email, assignedUser.firstname, ticket.id, ticket.title, ticket.description,ticketUrl);
    logger.info(`Ticket ${id} assigned to user ${assignedUser.id}`);
    return res.status(200).json({ message: 'Ticket assigned successfully', ticket });
  } catch (error) {
    logger.error(`Error assigning ticket: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSupportTeamUsers = async (req, res) => {
  try {
    const supportDepartment = await Department.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.fn('TRIM', Sequelize.col('name'))),
        'support team department'
      )
    });
    if (!supportDepartment) {
      return res.status(404).json({ message: 'Support Team department not found' });
    }
    const users = await User.findAll({
      where: { departmentId: supportDepartment.id },
      attributes: ['id', 'firstname', 'lastname', 'email'],
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found in Support Team department' });
    }
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }

    const tickets = await Ticket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',  
          attributes: ['id', 'firstname']
        },
        {
          model: User,
          as: 'assignedUser',  
          attributes: ['id', 'firstname']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      total: tickets.count,
      page: parseInt(page),
      totalPages: Math.ceil(tickets.count / limit),
      tickets: tickets.rows
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',  
          attributes: ['id', 'firstname']
        },
        {
          model: User,
          as: 'assignedUser',  
          attributes: ['id', 'firstname']
        }
      ],
    });

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    return res.status(200).json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Open', 'Pending', 'Resolved', 'Closed','In Progress'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.status = status;
    await ticket.save();

    return res.status(200).json({ message: 'Status updated', ticket });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const getTicketStatusCount = async (req, res) => {
  try {
    const totalTickets = await Ticket.count();
    const openTickets = await Ticket.count({ where: { status: 'Open' } });
    const closedTickets = await Ticket.count({ where: { status: 'Closed' } });
    const pendingTickets = await Ticket.count({ where: { status: 'Pending' } });
    const resolvedTickets = await Ticket.count({ where: { status: 'Resolved' } });
    const inProgressTickets = await Ticket.count({ where: { status: 'In Progress' } });

    return res.status(200).json({
      totalTickets,
      openTickets,
      closedTickets,
      pendingTickets,
      resolvedTickets,
      inProgressTickets
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, category} = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    let categoryData = null;
    if (category) {
      categoryData = await Category.findOne({ where: { name: category } });
      if (!categoryData) {
        return res.status(404).json({ message: 'Category not found' });
      }
    }
    // let assignedUser = null;
    // if (assignedTo) {
    //   assignedUser = await User.findByPk(assignedTo);
    //   if (!assignedUser) {
    //     return res.status(404).json({ message: 'Assigned user not found' });
    //   }
    // }
    await ticket.update({
      title: title || ticket.title,
      description: description || ticket.description,
      priority: priority || ticket.priority,
      categoryId: categoryData ? categoryData.id : ticket.categoryId,
      // assignedTo: assignedUser ? assignedUser.id : ticket.assignedTo,
    });

    logger.info(`Ticket ${id} updated successfully`);
    return res.status(200).json({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    logger.error(`Error updating ticket: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const viewTicket = async (req, res) => {
  try {
    const { id } = req.params; 
    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.status(200).json({
      message: 'Ticket details retrieved successfully',
      ticket: {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        assignedTo: ticket.assignedTo,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const ticketFolder = path.join(__dirname, '../uploads', id);
    if (fs.existsSync(ticketFolder)) {
      fs.rmSync(ticketFolder, { recursive: true, force: true });
      console.log(`Deleted folder: ${ticketFolder}`);
    }
    await ticket.destroy();
    return res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createTicket,
  assignTicket,
  getSupportTeamUsers,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  getTicketStatusCount,
  updateTicket,
  viewTicket,
  deleteTicket
};

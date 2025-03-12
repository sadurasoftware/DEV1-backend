const Ticket = require('../models/Ticket');
const logger = require('../config/logger');
const Category = require('../models/Category');
const User = require('../models/User');
const Department = require('../models/Department');

const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category, assignedTo } = req.body;
    const createdBy = req.user.id; 
    const ticketId = req.ticketId; 

    if (!title || !description || !priority || !category || !assignedTo) {
      logger.warn('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    const categoryData = await Category.findOne({ where: { name: category } });
    if (!categoryData) {
      logger.warn(`Category not found: ${category}`);
      return res.status(404).json({ message: 'Category not found' });
    }
    const supportDepartment = await Department.findOne({ where: { name: 'Support Team' } });
    if (!supportDepartment) {
      logger.warn('Support Team department not found');
      return res.status(404).json({ message: 'Support Team department not found' });
    }
    const assignedUser = await User.findOne({
      where: { firstname: assignedTo, departmentId: supportDepartment.id },
    });
    if (!assignedUser) {
      logger.warn(`Assigned user not found in Support Team: ${assignedTo}`);
      return res.status(404).json({ message: 'Assigned user not found in Support Team' });
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
      assignedTo: assignedUser.id,
    });

    logger.info(`Ticket created successfully: ${ticketId}`);
    return res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    logger.error(`Error creating ticket: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const getSupportTeamUsers = async (req, res) => {
  try {
    const supportDepartment = await Department.findOne({ where: { name: 'Support Team' } });
    if (!supportDepartment) {
      logger.warn('Support Team department not found');
      return res.status(404).json({ message: 'Support Team department not found' });
    }
    const users = await User.findAll({
      where: { departmentId: supportDepartment.id },
      attributes: ['id', 'firstname', 'lastname', 'email'],
    });

    if (users.length === 0) {
      logger.info('No users found in Support Team department');
      return res.status(404).json({ message: 'No users found in Support Team department' });
    }

    logger.info(`Found ${users.length} users in Support Team department`);
    return res.status(200).json({ users });
  } catch (error) {
    logger.error(`Error fetching Support Team users: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll();
    return res.status(200).json({ message: 'All tickets fetched successfully', tickets });
  } catch (error) {
    logger.error(`Error fetching tickets: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id, { include: [Category, User] });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.status(200).json({ message: 'Ticket details fetched successfully', ticket });
  } catch (error) {
    logger.error(`Error fetching ticket: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, assignedTo } = req.body;
    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.title = title || ticket.title;
    ticket.description = description || ticket.description;
    ticket.priority = priority || ticket.priority;

    if (assignedTo) {
      const supportUser = await User.findOne({ where: { firstname: assignedTo, departmentId: ticket.assignedTo } });
      if (!supportUser) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
      ticket.assignedTo = supportUser.id;
    }

    await ticket.save();
    return res.status(200).json({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    logger.error(`Error updating ticket: ${error.message}`);
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

    await ticket.destroy();
    return res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting ticket: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const { userId } = req.user;
    const tickets = await Ticket.findAll({ where: { createdBy: userId }, include: [Category] });
    return res.status(200).json({ message: 'User tickets fetched successfully', tickets });
  } catch (error) {
    logger.error(`Error fetching user tickets: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createTicket,
  getSupportTeamUsers,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getUserTickets,
};

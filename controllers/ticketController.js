const Ticket = require('../models/Ticket');
const logger = require('../config/logger');
const Category = require('../models/Category');
const User = require('../models/User'); 

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

    const assignedUser = await User.findByPk(assignedTo);
    if (!assignedUser) {
      logger.warn(`Assigned user not found: ${assignedTo}`);
      return res.status(404).json({ message: 'Assigned user not found' });
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
      assignedTo,
    });

    logger.info(`Ticket created successfully: ${ticketId}`);
    return res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    logger.error(`Error creating ticket: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createTicket,
};

const Ticket = require('../models/Ticket');
const logger = require('../config/logger');
const Category = require('../models/Category');
const User = require('../models/User');
const Department = require('../models/Department');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');
const emailHelper = require('../utils/emailHelper');
const { Parser } = require('json2csv'); 
const ExcelJS = require('exceljs'); 
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');
const downloadsDir = path.join(os.homedir(), 'Downloads');
const { v4: uuidv4 } = require('uuid');


const createTicket = async (req, res) => {
  try {
    // const ticketId = uuidv4();
    // req.ticketId = ticketId;
    const { title, description, priority, category} = req.body;
    const createdBy = req.user.id;
    const ticketId = req.ticketId || uuidv4();
    if (!title || !description || !priority || !category) {
      logger.warn('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    const categoryData = await Category.findOne({ where: { name: category } });
    if (!categoryData) {
      logger.warn(`Category not found: ${category}`);
      return res.status(404).json({ message: 'Category not found' });
    }
    // let attachmentUrl = null;
    // if (req.file) {
    //   attachmentUrl = await uploadToS3(
    //     req.file.buffer,
    //     ticketId,
    //     req.file.originalname,
    //     req.file.mimetype
    //   );
    // }
    let attachment = null;
    if (req.file && req.file.key) {
      attachment = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
    }
    const ticket = await Ticket.create({
      id: ticketId,
      title,
      description,
      attachment,
      priority,
      categoryId: categoryData.id,
      createdBy,
      assignedTo:null,
    });

    logger.info(`Ticket created successfully: ${ticketId}`);
    return res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    logger.error(`Error creating ticket: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getImage = async (req, res) => {
  try {
    const { ticketId, filename } = req.params;

    if (!ticketId || !filename) {
      return res.status(400).json({ message: 'ticketId and filename are required' });
    }

    const bucketName = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;

    const key = `${ticketId}/${filename}`;
    const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error generating image URL:', error);
    return res.status(500).json({ message: 'Failed to get image', error: error.message });
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

// const getTickets = async (req, res) => {
//   try {
//     const userId = req.user.id; 

//     const user = await User.findByPk(userId, {
//       include: { model: Department, as: 'department' }
//     });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     let tickets;

//     if (user.department?.name.toLowerCase().trim() === 'support team department') {
//       tickets = await Ticket.findAll({
//         include: [
//           { model: User, as: 'user', attributes: ['id', 'firstname', 'email'] },
//           { model: User, as: 'assignedUser', attributes: ['id', 'firstname', 'email'] },
//           { model: Category, as: 'category', attributes: ['id', 'name'] }
//         ],
//         order: [['createdAt', 'DESC']]
//       });
//     } else {
//       tickets = await Ticket.findAll({
//         where: { createdBy: userId },
//         include: [
//           { model: User, as: 'user', attributes: ['id', 'firstname', 'email'] },
//           { model: User, as: 'assignedUser', attributes: ['id', 'firstname', 'email'] },
//           { model: Category, as: 'category', attributes: ['id', 'name'] }
//         ],
//         order: [['createdAt', 'DESC']]
//       });
//     }

//     return res.status(200).json({ tickets });
//   } catch (error) {
//     console.error('Error fetching tickets:', error.message);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
const getTicketsByUser = async (req, res) => {
  try {
    const { userId } = req.params; 
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tickets = await Ticket.findAll({
      where: { createdBy: userId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstname', 'email'] },  
        { model: User, as: 'assignedUser', attributes: ['id', 'firstname', 'email'] }, 
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ tickets });

  } catch (error) {
    console.error('Error fetching user-created tickets:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const getSolvedTicketsByUser = async (req, res) => {
  try {
    const { userId } = req.params; 
    const user = await User.findOne({
      where: { id: userId },
      include: [{ model: Department, as: 'department', attributes: ['name'] }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.department || user.department.name.toLowerCase().trim() !== 'support team department') {
      return res.status(403).json({ message: 'User is not part of the Support Team' });
    }

    const solvedTicketCount = await Ticket.count({
      where: {
        assignedTo: userId,
        status: ['Resolved'] 
      }
    });

    return res.status(200).json({
      userId,
      solvedTickets: solvedTicketCount
    });

  } catch (error) {
    console.error('Error fetching solved tickets count:', error.message);
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
    const userId = req.user.id; 

    const allowedStatuses = ['Open', 'Pending', 'Resolved', 'Closed', 'In Progress'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const user = await User.findByPk(userId, { 
      include: { model: Department, as: 'department' } 
    });

    if (!user || !user.department) {
      return res.status(403).json({ message: 'Unauthorized: User not in any department' });
    }
    if (user.department.name.toLowerCase().trim() !== 'support team department') {
      return res.status(403).json({ message: 'Unauthorized: Only Support Team can update status' });
    }
    ticket.status = status;
    await ticket.save();
    return res.status(200).json({ message: 'Status updated', ticket });

  } catch (error) {
    console.error('Error updating ticket status:', error.message);
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
    console.log('req.body', req.body);
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
const generateUniqueFilePath = (dir, baseName, extension) => {
  let filePath = path.join(dir, `${baseName}.${extension}`);
  let counter = 1;
  while (fs.existsSync(filePath)) {
    filePath = path.join(dir, `${baseName}(${counter}).${extension}`);
    counter++;
  }
  return filePath;
};
const exportTickets = async (req, res) => {
  try {
    const { format } = req.query;
    if (!['csv', 'excel', 'pdf'].includes(format)) {
      return res.status(400).json({ message: 'Invalid format. Use csv, excel, or pdf' });
    }

    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const tickets = await Ticket.findAll({
      include: [
        { model: User, as: 'user', attributes: ['firstname', 'email'] },
        { model: User, as: 'assignedUser', attributes: ['firstname', 'email'] },
        { model: Category, as: 'category', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!tickets.length) {
      return res.status(404).json({ message: 'No tickets found' });
    }

    const data = tickets.map(ticket => ({
      ID: ticket.id,
      Title: ticket.title,
      Description: ticket.description,
      Status: ticket.status,
      Priority: ticket.priority,
      Category: ticket.category?.name || 'N/A',
      CreatedBy: ticket.user ? `${ticket.user.firstname} (${ticket.user.email})` : 'N/A',
      AssignedTo: ticket.assignedUser ? `${ticket.assignedUser.firstname} (${ticket.assignedUser.email})` : 'Unassigned',
      CreatedAt: ticket.createdAt,
      UpdatedAt: ticket.updatedAt
    }));

    let filePath;

    if (format === 'csv') {
      filePath = generateUniqueFilePath(downloadsDir, 'tickets', 'csv');
      const parser = new Parser();
      fs.writeFileSync(filePath, parser.parse(data));
    } else if (format === 'excel') {
      filePath = generateUniqueFilePath(downloadsDir, 'tickets', 'xlsx');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Tickets');

      worksheet.columns = [
        { header: 'ID', key: 'ID' },
        { header: 'Title', key: 'Title' },
        { header: 'Description', key: 'Description' },
        { header: 'Status', key: 'Status' },
        { header: 'Priority', key: 'Priority' },
        { header: 'Category', key: 'Category' },
        { header: 'Created By', key: 'CreatedBy' },
        { header: 'Assigned To', key: 'AssignedTo' },
        { header: 'Created At', key: 'CreatedAt' },
        { header: 'Updated At', key: 'UpdatedAt' }
      ];

      worksheet.addRows(data);
      await workbook.xlsx.writeFile(filePath);
    } else if (format === 'pdf') {
      filePath = generateUniqueFilePath(downloadsDir, 'tickets', 'pdf');
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(filePath));

      doc.fontSize(20).text('Ticket Report', { align: 'center' });
      doc.moveDown();

      data.forEach(ticket => {
        doc.fontSize(12).text(`ID: ${ticket.ID}`);
        doc.text(`Title: ${ticket.Title}`);
        doc.text(`Description: ${ticket.Description}`);
        doc.text(`Status: ${ticket.Status}`);
        doc.text(`Priority: ${ticket.Priority}`);
        doc.text(`Category: ${ticket.Category}`);
        doc.text(`Created By: ${ticket.CreatedBy}`);
        doc.text(`Assigned To: ${ticket.AssignedTo}`);
        doc.text(`Created At: ${ticket.CreatedAt}`);
        doc.text(`Updated At: ${ticket.UpdatedAt}`);
        doc.moveDown();
      });

      doc.end();
    }

    return res.status(200).json({
      message: `Tickets exported successfully in ${format} format`,
      file: filePath
    });

  } catch (error) {
    console.error('Error exporting tickets:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params; 
    const { categoryName } = req.body; 
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = categoryName;
    await category.save();

    await Ticket.update(
      { categoryId: category.id }, 
      { where: { categoryId: id } }
    );

    return res.status(200).json({
      message: 'Category and related tickets updated successfully',
      categoryId: category.id,
      categoryName: category.name
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params; 
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await Ticket.destroy({ where: { categoryId: id } });
    await category.destroy();

    return res.status(200).json({ message: 'Category and related tickets deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createTicket,
  assignTicket,
  getSupportTeamUsers,
  //getTickets,
  getTicketsByUser,
  getSolvedTicketsByUser,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  getTicketStatusCount,
  updateTicket,
  viewTicket,
  deleteTicket,
  exportTickets,
  getImage,

  updateCategory,
  deleteCategory
};

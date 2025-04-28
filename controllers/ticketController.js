const {Ticket,Role,User,Category,Department,Comment,TicketAttachment,TicketHistory} = require('../models');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');
const emailHelper = require('../utils/emailHelper');
const { deleteS3Folder,getImageUrl} = require('../utils/fileHelper');
const { Parser } = require('json2csv'); 
const ExcelJS = require('exceljs'); 
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');
const downloadsDir = path.join(os.homedir(), 'Downloads');
const { v4: uuidv4 } = require('uuid');

const createTicket = async (req, res) => {
  try {;
    const { title, description, priority, category} = req.body;
    const createdBy = req.user.id;
    const ticketId = req.ticketId || uuidv4();
    if (!title || !description || !priority || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const categoryData = await Category.findOne({ where: { name: category } });
    if (!categoryData) {
      return res.status(404).json({ message: 'Category not found' });
    }
    // let attachment = null;
    // if (req.file && req.file.key) {
    //   attachment = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
    // }
    const ticket = await Ticket.create({
      id: ticketId,
      title,
      description,
      //attachment,
      priority,
      categoryId: categoryData.id,
      createdBy,
      assignedTo:null,
    });
    let attachmentUrls = [];

    // Save attachments if files exist
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => {
        const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`;
        attachmentUrls.push(url);

        return {
          ticketId: ticket.id,
          url
        };
      });

      await TicketAttachment.bulkCreate(attachments);
    }
    await TicketHistory.create({
      ticketId: ticket.id,
      action: 'Ticket Created',
      oldValue: null,
      newValue: `Created with status ${ticket.status}`,
      changedBy: createdBy,
    })
    return res.status(201).json({ message: 'Ticket created successfully', ticket ,attachments: attachmentUrls});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getImage = async (req, res) => {
  try {
    const { ticketId, filename } = req.params;
    if (!ticketId || !filename) {
      return res.status(400).json({ message: 'ticketId and filename are required' });
    }
    const imageUrl = await getImageUrl(ticketId, filename);
    return res.status(200).json({ imageUrl });
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ message: 'Image not found in S3 bucket' });
    }
    console.error('Error getting image from S3:', error);
    return res.status(500).json({ message: 'Failed to get image', error: error.message });
  }
};
const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body; 
    const changedBy = req.user.id;
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
    const oldAssignedTo = ticket.assignedTo;
    ticket.assignedTo = assignedUser.id;
    await ticket.save();
    await TicketHistory.create({
      ticketId: ticket.id,
      action: 'Assigned To',
      oldValue: oldAssignedTo ? oldAssignedTo.toString() : null,
      newValue: assignedUser.id.toString(),
      changedBy
    });
    const ticketUrl = `${process.env.TICKET_ASSIGN_URL}/tickets?ticketId=${ticket.id}`
    await emailHelper.ticketAssignedEmail(assignedUser.email, assignedUser.firstname, ticket.id, ticket.title, ticket.description,ticketUrl);
    return res.status(200).json({ message: 'Ticket assigned successfully', ticket });
  } catch (error) {
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
          attributes: ['id', 'firstname','email']
        },
        {
          model: User,
          as: 'assignedUser',  
          attributes: ['id', 'firstname']
        },
        {
          model: TicketAttachment,
          as: 'attachments',
          attributes: ['id', 'url', 'createdAt']
        }
      ],
    });

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    return res.status(200).json({message: 'Ticket fetched successfully',ticket });
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
    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();
    await TicketHistory.create({
      ticketId: ticket.id,
      action: 'Status Updated',
      oldValue: oldStatus,
      newValue: status,
      changedBy: userId
    });
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
    const ticketId = req.params.id;
    const { title, description, priority, category} = req.body;
    const changedBy = req.user.id;
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const updates = {};
    const historyEntries = [];
    if (title && title !== ticket.title) {
      historyEntries.push({
        action: 'Title Updated',
        oldValue: JSON.stringify({ title: ticket.title }),
        newValue: JSON.stringify({ title }),
        ticketId,
        changedBy
      });
      updates.title = title;
    }
    if (description && description !== ticket.description) {
      historyEntries.push({
        action: 'Description Updated',
        oldValue: JSON.stringify({ description: ticket.description }),
        newValue: JSON.stringify({ description }),
        ticketId,
        changedBy
      });
      updates.description = description;
    }
    if (priority && priority !== ticket.priority) {
      historyEntries.push({
        action: 'Priority Updated',
        oldValue: JSON.stringify({ priority: ticket.priority }),
        newValue: JSON.stringify({ priority }),
        ticketId,
        changedBy
      });
      updates.priority = priority;
    }
    if (category) {
      const categoryData = await Category.findOne({ where: { name: category } });
      if (!categoryData) {
        return res.status(404).json({ message: 'Category not found' });
      }
      if (categoryData.id !== ticket.categoryId) {
        historyEntries.push({
          action: 'Category Updated',
          oldValue: JSON.stringify({ categoryId: ticket.categoryId }),
          newValue: JSON.stringify({ categoryId: categoryData.id }),
          ticketId,
          changedBy
        });
        updates.categoryId = categoryData.id;
      }
    }
    await ticket.update(updates);
    let newAttachmentUrls = [];
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => {
        const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`;
        newAttachmentUrls.push(url);
        return {
          ticketId: ticket.id,
          url
        };
      });
      await TicketAttachment.bulkCreate(attachments);
      historyEntries.push({
        action: 'New Attachments Added',
        oldValue: null,
        newValue: JSON.stringify({ attachments: newAttachmentUrls }),
        ticketId,
        changedBy
      });
    }
    if (historyEntries.length > 0) {
      await TicketHistory.bulkCreate(historyEntries);
    }
    const allAttachments = await TicketAttachment.findAll({
      where: { ticketId: ticket.id },
      attributes: ['url']
    });
    const allUrls = allAttachments.map(att => att.url);
    return res.status(200).json({
      message: 'Ticket updated successfully',
      ticket,
      attachments: allUrls,
      newUploaded: newAttachmentUrls
    });
  } catch (error) {
    console.error('Update Ticket Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const viewTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'commenter',
              attributes: ['id', 'firstname', 'lastname', 'email'],
              include: [
                {
                  model: Role,
                  as: 'role',
                  attributes: ['name']
                }
              ]
            }
          ]
        }
      ]
    });

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
        comments: ticket.comments.map(comment => ({
          id: comment.id,
          text: comment.commentText,
          attachment: comment.attachment,
          createdAt: comment.createdAt,
          updatedBy: comment.commenter
            ? {
                id: comment.commenter.id,
                firstname: comment.commenter.firstname,
                lastname: comment.commenter.lastname,
                email: comment.commenter.email,
                role: comment.commenter.role?.name || 'N/A'
              }
            : null
        }))
      }
    });
  } catch (error) {
    console.error('View Ticket Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    await TicketHistory.create({
      ticketId: ticket.id,
      action: 'Ticket Deleted',
      oldValue: JSON.stringify({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status
      }),
      newValue: null,
      changedBy: userId
    });
    await deleteS3Folder(id);

    await ticket.destroy();
    
    return res.status(200).json({ message: 'Ticket and associated S3 files deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
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
    const { format, startDate, endDate } = req.query;

    if (!['csv', 'excel', 'pdf'].includes(format)) {
      return res.status(400).json({ message: 'Invalid format. Use csv, excel, or pdf' });
    }

    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['firstname', 'email'] },
        { model: User, as: 'assignedUser', attributes: ['firstname', 'email'] },
        { model: Category, as: 'category', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!tickets.length) {
      return res.status(404).json({ message: 'No tickets found in this date range' });
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
const getTicketHistory = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const history = await TicketHistory.findAll({
      where: { ticketId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstname', 'lastname']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const tryParseJSON = (value) => {
      if (!value) return null;
      if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    };

    const formattedHistory = history.map(entry => ({
      id: entry.id,
      action: entry.action,
      oldValue: tryParseJSON(entry.oldValue),
      newValue: tryParseJSON(entry.newValue),
      changedBy: `${entry.user.firstname} ${entry.user.lastname}`,
      changedAt: entry.createdAt
    }));

    return res.status(200).json({ history: formattedHistory });

  } catch (error) {
    console.error('Error fetching ticket history:', error);
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
  getTicketHistory,

  updateCategory,
  deleteCategory
};

const {Ticket, User,Role } = require('../models');
const Comment=require('../models/Comment')
const { upload } = require('../utils/fileHelper');
const { Op, Sequelize } = require('sequelize');

const addComment = async (req, res) => {
    try {
        const {ticketId} = req.params;
      const {commentText } = req.body;
      const userId = req.user.id; // Logged-in user (support team member)
  
      // Check ticket existence
      const ticket = await Ticket.findByPk(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      if (ticket.assignedTo !== userId) {
        return res.status(403).json({
          message: 'You are not authorized to comment on this ticket. Only the assigned support member can comment.',
        });
      }
  
      // Handle attachment from S3
      let attachment = null;
      if (req.file && req.file.key) {
        attachment = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
      }
  
      // Create comment
      const comment = await Comment.create({
        ticketId: ticket.id,
        commentText,
        attachment,
        updatedBy: userId,
      });
  
      // Find the assigned user with role name
      const assignedUser = await User.findByPk(ticket.assignedTo, {
        include: {
          model: Role,
          as: 'role',
          attributes: ['name'],
        },
      });
  
      if (!assignedUser) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
  
      return res.status(201).json({
        message: 'Comment added successfully',
        comment: {
          id: comment.id,
          ticketId: comment.ticketId,
          commentText: comment.commentText,
          attachment: comment.attachment,
          updatedBy: {
            id: assignedUser.id,
            firstname: assignedUser.firstname,
            role: assignedUser.role?.name || 'N/A',
          },
          createdAt: comment.createdAt,
        },
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
module.exports = {
  addComment
};

const {Ticket, User,Role,Comment,CommentAttachment} = require('../models');
const { deleteFileFromS3 } = require('../utils/fileHelper');
const path = require('path');
const addComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { commentText } = req.body;
    const userId = req.user.id;
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (ticket.assignedTo !== userId) {
      return res.status(403).json({
        message: 'You are not authorized to comment on this ticket. Only the assigned support member can comment.',
      });
    }
    const comment = await Comment.create({
      ticketId: ticket.id,
      commentText,
      updatedBy: userId,
    });
    let attachmentUrls = [];
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => {
        const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`;
        attachmentUrls.push(url);
        return {
          commentId: comment.id,
          url
        };
      });
      await CommentAttachment.bulkCreate(attachments);
    }
    const assignedUser = await User.findByPk(userId, {
      include: {
        model: Role,
        as: 'role',
        attributes: ['name'],
      },
    });
    return res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: comment.id,
        ticketId: comment.ticketId,
        commentText: comment.commentText,
        attachments: attachmentUrls,
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
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { ticketId, commentId } = req.params;
    const { commentText } = req.body;
    const userId = req.user.id;
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const comment = await Comment.findOne({ where: { id: commentId, ticketId } });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.updatedBy !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this comment.' });
    }
    if (commentText) {
      comment.commentText = commentText;
      await comment.save();
    }
    let attachmentUrls = [];
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => {
        const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`;
        attachmentUrls.push(url);

        return {
          commentId: comment.id,
          url
        };
      });

      await CommentAttachment.bulkCreate(attachments);
    }
    const allAttachments = await CommentAttachment.findAll({
      where: { commentId: comment.id },
      attributes: ['url']
    });
    const attachmentList = allAttachments.map(att => att.url);
    const user = await User.findByPk(userId, {
      include: {
        model: Role,
        as: 'role',
        attributes: ['name'],
      },
    });
    return res.status(200).json({
      message: 'Comment updated successfully',
      comment: {
        id: comment.id,
        ticketId: comment.ticketId,
        commentText: comment.commentText,
        attachments: attachmentList,
        updatedBy: {
          id: user.id,
          firstname: user.firstname,
          role: user.role?.name || 'N/A',
        },
        updatedAt: comment.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update comment error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const getTicketComments = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const comments = await Comment.findAll({
      where: { ticketId },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'commenter',
          attributes: ['id', 'firstname', 'lastname'],
          include: {
            model: Role,
            as: 'role',
            attributes: ['name']
          }
        },
        {
          model: CommentAttachment,
          as: 'attachments',
          attributes: ['id', 'url'],
        }
      ]
    });
    return res.status(200).json({ ticketId, comments });
  } catch (error) {
    console.error('Get ticket comments error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
  const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    try {
      const comment = await Comment.findByPk(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      if (comment.updatedBy !== userId) {
        return res.status(403).json({ message: 'You are not authorized to delete this comment' });
      }
      const attachments = await CommentAttachment.findAll({
        where: { commentId }
      });
      if (comment.attachments && comment.attachments.length > 0) {
        for (const attachment of comment.attachments) {
          const url = new URL(attachment.url);
          const key = decodeURIComponent(url.pathname.substring(1)); 
          await deleteFileFromS3(key);
        }
      }
      await CommentAttachment.destroy({ where: { commentId } });
      await comment.destroy();
      return res.status(200).json({ message: 'Comment and attachment deleted successfully' });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  const getCommentById = async (req, res) => {
    try {
      const { commentId } = req.params;
      const comment = await Comment.findByPk(commentId, {
        include: [
          {
            model: User,
            as: 'commenter',
            attributes: ['id', 'firstname', 'lastname'],
            include: {
              model: Role,
              as: 'role',
              attributes: ['name']
            }
          },
          {
            model: CommentAttachment,
            as: 'attachments',
            attributes: ['id', 'url', 'createdAt']
          }
        ]
      });
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      return res.status(200).json({ comment });
    } catch (error) {
      console.error('Get comment by ID error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
module.exports = {
  addComment,
  updateComment,
  getTicketComments,
  deleteComment,
  getCommentById
};

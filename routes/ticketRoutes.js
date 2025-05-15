const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const {upload} = require('../utils/fileHelper');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3 } = require('../utils/fileHelper');
const {imageTypes, videoTypes, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } = require('../utils/fileHelper');
const validator=require('../validator/router-validator')
const { authenticateToken } = require('../middlewares/authMiddleware');
const {checkPermission,checkRole}=require('../middlewares/checkRole');
const multer = require('multer');
const { Ticket } = require('../models');

const setTicketIdFromParams = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    req.ticketId = ticket.id; 
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const uploadFile = (req, res, next) => {
    const uploadSingle = upload.single('attachments');
    uploadSingle(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Multer error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };

const uploadMultipleFile = async (req, res, next) => {
    const uploadHandler = upload.array('attachments', 5); 
  
    uploadHandler(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).json({
              message: 'One or more files exceed the maximum allowed size. Images ≤ 5MB, Videos ≤ 10MB.',
            });
          case 'LIMIT_FILE_COUNT':
          case 'LIMIT_UNEXPECTED_FILE':
            return res.status(400).json({
              message: 'Too many files uploaded. Maximum 5 attachments allowed.',
            });
          default:
            return res.status(400).json({ message: `Multer error: ${err.message}` });
        }
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
  
      for (const file of req.files) {
        const isImage = imageTypes.includes(file.mimetype);
        const isVideo = videoTypes.includes(file.mimetype);
  
        if (!isImage && !isVideo) {
          await s3.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.key,
          }));
          return res.status(400).json({
            message: `Unsupported file type: "${file.originalname}". Only JPG, PNG, MP4, MKV allowed.`,
          });
        }
        if (isImage && file.size > MAX_IMAGE_SIZE) {
          await s3.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.key,
          }));
          return res.status(400).json({
            message: `Image "${file.originalname}" exceeds the 5MB size limit.`,
          });
        }
        if (isVideo && file.size > MAX_VIDEO_SIZE) {
          await s3.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.key,
          }));
          return res.status(400).json({
            message: `Video "${file.originalname}" exceeds the 10MB size limit.`,
          });
        }
      }
      next();
    });
  };
router.post('/create', authenticateToken,uploadMultipleFile,checkPermission("Ticket","create"),validator.createTicketSchemaValidator,ticketController.createTicket);
router.patch('/assign-ticket/:id',authenticateToken,validator.assignTicketParamsSchemaValidator,validator.assignTicketSchemaValidator,ticketController.assignTicket)
router.get('/support-team',ticketController.getSupportTeamUsers);
//router.get('/get-tickets/support-team-user',authenticateToken,ticketController.getTickets);
router.get('/user-tickets/:userId',authenticateToken,validator.getUserByTicketsSchemaValidator,ticketController.getTicketsByUser);
router.get('/user-solved-tickets/:userId',ticketController.getSolvedTicketsByUser);
router.get('/get-all-tickets',authenticateToken,checkRole('superadmin','admin'),ticketController.getAllTickets);
router.get('/get-ticket/:id',validator.getTicketByIdSchemaValidator,ticketController.getTicketById);
router.put('/update-ticket-status/:id',authenticateToken,validator.updateTicketStatusParamsSchemaValidator,validator.updateTicketStatusSchemaValidator,ticketController.updateTicketStatus);
router.get('/dashboard',ticketController.getTicketStatusCount);
router.get('/view-ticket/:id',authenticateToken,checkPermission("Ticket","read"),validator.viewTicketSchemaValidator, ticketController.viewTicket);
router.put('/update-ticket/:id',setTicketIdFromParams,authenticateToken,uploadMultipleFile,checkPermission("Ticket","write"),validator.updateTicketParamsSchemaValidator,validator.updateTicketSchemaValidator,ticketController.updateTicket);
router.delete('/delete-ticket/:id',authenticateToken,checkPermission("Ticket","delete"),validator.deleteTicketSchemaValidator,ticketController.deleteTicket);
router.get('/export',authenticateToken,checkRole('superadmin','admin'),validator.exportTicketsSchemaValidator, ticketController.exportTickets);
router.get('/:ticketId/history', ticketController.getTicketHistory);
router.put('/category/update/:id',ticketController.updateCategory);
router.delete('/category/delete/:id',ticketController.deleteCategory);
router.get('/get-image/:ticketId/:filename',validator.getImageSchemaValidator,ticketController.getImage);
module.exports = router;
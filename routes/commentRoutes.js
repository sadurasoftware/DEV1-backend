const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const { upload } = require('../utils/fileHelper');
const validator =require('../validator/router-validator')
const multer = require('multer');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3 } = require('../utils/fileHelper');
const {imageTypes, videoTypes, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } = require('../utils/fileHelper');
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

const setTicketId = (req, res, next) => {
    req.ticketId = req.body.ticketId || req.params.ticketId;
    next();
  };

router.post('/:ticketId', authenticateToken, setTicketId,uploadMultipleFile,validator.addcommentParmasValidator, validator.addcommentValidator,commentController.addComment);
router.put('/update/:ticketId/:commentId', authenticateToken,setTicketId,uploadMultipleFile,validator.updateCommentParamsValidation, validator.updatecommentValidatior, commentController.updateComment);
router.get('/get/:ticketId',validator.getTicketCommentValidator,commentController.getTicketComments);
router.delete('/delete/:commentId', authenticateToken,validator.deleteCommentValidator,commentController.deleteComment);
router.get('/:commentId',validator.getCommentByIdValidator,commentController.getCommentById);
module.exports = router;

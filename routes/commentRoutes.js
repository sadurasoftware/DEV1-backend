const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const { upload } = require('../utils/fileHelper');
const validator =require('../validator/router-validator')
const multer = require('multer');
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
    const uploadMultipleFile = (req, res, next) => {
    const uploadMultiple = upload.array('attachments',5); 
  
    uploadMultiple(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: 'Only 5 attachments are allowed' });
        }
        return res.status(400).json({ message: `Multer error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
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

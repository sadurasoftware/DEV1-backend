const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const { upload } = require('../utils/fileHelper');
const validator =require('../validator/router-validator')
const multer = require('multer');
const uploadFile = (req, res, next) => {
    const uploadSingle = upload.single('attachment');
    uploadSingle(req, res, function (err) {
      if (err instanceof multer.MulterError) {
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

router.post('/:ticketId', authenticateToken, setTicketId,uploadFile,validator.addcommentParmasValidator, validator.addcommentValidator,commentController.addComment);
router.put('/update/:ticketId/:commentId', authenticateToken,setTicketId,uploadFile,validator.updateCommentParamsValidation, validator.updatecommentValidatior, commentController.updateComment);
router.get('/get/:ticketId',validator.getTicketCommentValidator,commentController.getTicketComments);
router.delete('/delete/:commentId', authenticateToken,validator.deleteCommentValidator,commentController.deleteComment);
router.get('/:commentId',validator.getCommentByIdValidator,commentController.getCommentById);
module.exports = router;

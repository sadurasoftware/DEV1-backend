const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const { upload } = require('../utils/fileHelper');

const setTicketId = (req, res, next) => {
    req.ticketId = req.body.ticketId || req.params.ticketId;
    next();
  };
router.post('/:ticketId', authenticateToken, setTicketId,upload.single('attachment'), commentController.addComment);
router.put('/update/:id', authenticateToken, commentController.updateComment);
router.get('/get/:ticketId',commentController.getTicketComments);
router.delete('/delete/:commentId', authenticateToken,commentController.deleteComment);
module.exports = router;

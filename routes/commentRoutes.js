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

module.exports = router;

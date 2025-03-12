const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const upload = require('../utils/fileHelper');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/create', authenticateToken, upload.single('attachment'),ticketController.createTicket);
router.get('/support-team',ticketController.getSupportTeamUsers);
router.get('/get-all-tickets',ticketController.getAllTickets);
module.exports = router;

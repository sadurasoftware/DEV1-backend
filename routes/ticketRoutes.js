const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const upload = require('../utils/fileHelper');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/create', authenticateToken, upload.single('attachment'),ticketController.createTicket);
router.patch('/assign-ticket/:id',ticketController.assignTicket)
router.get('/support-team',ticketController.getSupportTeamUsers);
router.get('/get-all-tickets',ticketController.getAllTickets);
router.get('/get-ticket/:id',ticketController.getTicketById);
router.put('/update-ticket-status/:id',ticketController.updateTicketStatus);
router.get('/tickets-status-count', ticketController.getTicketStatusCount);

module.exports = router;

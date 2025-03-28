const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const upload = require('../utils/fileHelper');
const validator=require('../validator/router-validator')
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/create', authenticateToken, upload.single('attachment'),validator.createTicketSchemaValidator,ticketController.createTicket);
router.patch('/assign-ticket/:id',validator.assignTicketParamsSchemaValidator,validator.assignTicketSchemaValidator,ticketController.assignTicket)
router.get('/support-team',ticketController.getSupportTeamUsers);
router.get('/get-all-tickets',ticketController.getAllTickets);
router.get('/get-ticket/:id',validator.getTicketByIdSchemaValidator,ticketController.getTicketById);
router.put('/update-ticket-status/:id',validator.updateTicketStatusParamsSchemaValidator,validator.updateTicketStatusSchemaValidator,ticketController.updateTicketStatus);
router.get('/tickets-status-count',ticketController.getTicketStatusCount);
router.get('/view-ticket/:id',validator.viewTicketSchemaValidator, ticketController.viewTicket);
router.put('/update-ticket/:id',validator.updateTicketParamsSchemaValidator,validator.updateTicketSchemaValidator,authenticateToken,ticketController.updateTicket);
router.delete('/delete-ticket/:id',validator.deleteTicketSchemaValidator, authenticateToken,ticketController.deleteTicket);
module.exports = router;

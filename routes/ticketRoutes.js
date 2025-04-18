const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const {upload} = require('../utils/fileHelper');
const validator=require('../validator/router-validator')
const { authenticateToken } = require('../middlewares/authMiddleware');
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
router.post('/create', authenticateToken, uploadFile,validator.createTicketSchemaValidator,ticketController.createTicket);
router.patch('/assign-ticket/:id',validator.assignTicketParamsSchemaValidator,validator.assignTicketSchemaValidator,ticketController.assignTicket)
router.get('/support-team',ticketController.getSupportTeamUsers);
//router.get('/get-tickets/support-team-user',authenticateToken,ticketController.getTickets);
router.get('/user-tickets/:userId',validator.getUserByTicketsSchemaValidator,ticketController.getTicketsByUser);
router.get('/user-solved-tickets/:userId',ticketController.getSolvedTicketsByUser);
router.get('/get-all-tickets',ticketController.getAllTickets);
router.get('/get-ticket/:id',validator.getTicketByIdSchemaValidator,ticketController.getTicketById);
router.put('/update-ticket-status/:id',authenticateToken,validator.updateTicketStatusParamsSchemaValidator,validator.updateTicketStatusSchemaValidator,ticketController.updateTicketStatus);
router.get('/tickets-status-count',ticketController.getTicketStatusCount);
router.get('/view-ticket/:id',validator.viewTicketSchemaValidator, ticketController.viewTicket);
router.put('/update-ticket/:id',validator.updateTicketParamsSchemaValidator,validator.updateTicketSchemaValidator,ticketController.updateTicket);
router.delete('/delete-ticket/:id',validator.deleteTicketSchemaValidator,ticketController.deleteTicket);
router.get('/export', validator.exportTicketsSchemaValidator, ticketController.exportTickets);

router.put('/category/update/:id',ticketController.updateCategory);
router.delete('/category/delete/:id',ticketController.deleteCategory);
router.get('/get-image/:ticketId/:filename',validator.getImageSchemaValidator,ticketController.getImage);
module.exports = router;

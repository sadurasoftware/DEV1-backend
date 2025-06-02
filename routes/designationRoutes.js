const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designationController');

router.post('/create',designationController. createDesignation);

module.exports = router;

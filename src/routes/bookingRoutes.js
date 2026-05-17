const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Only Customers can book tickets
// Route is mounted at /api/events, so this corresponds to /api/events/:id/book
router.post('/:id/book', authMiddleware, roleMiddleware(['CUSTOMER']), bookingController.bookTickets);

module.exports = router;

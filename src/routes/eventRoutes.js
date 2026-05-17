const express = require('express');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Both Customers and Organizers can view events
router.get('/', authMiddleware, eventController.getEvents);

// Only Organizers can create and update events
router.post('/', authMiddleware, roleMiddleware(['ORGANIZER']), eventController.createEvent);
router.put('/:id', authMiddleware, roleMiddleware(['ORGANIZER']), eventController.updateEvent);

module.exports = router;

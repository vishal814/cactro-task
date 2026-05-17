const prisma = require('../utils/prisma');
const { z } = require('zod');
const backgroundJobs = require('../queue/backgroundJobs');

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  date: z.string().transform((str) => new Date(str)),
  totalTickets: z.number().int().positive(),
});

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().transform((str) => new Date(str)).optional(),
});

exports.createEvent = async (req, res) => {
  try {
    const validatedData = eventSchema.parse(req.body);
    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        date: validatedData.date,
        totalTickets: validatedData.totalTickets,
        availableTickets: validatedData.totalTickets,
        organizerId: req.user.userId,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateEventSchema.parse(req.body);

    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { bookings: true }
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.organizerId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this event' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: validatedData,
    });

    // Background Task 2: Event Update Notification
    // Notify all customers who have booked tickets
    if (existingEvent.bookings.length > 0) {
      const bookedUserIds = existingEvent.bookings.map((b) => b.userId);
      // Remove duplicates
      const uniqueUserIds = [...new Set(bookedUserIds)];
      
      backgroundJobs.addEventUpdateNotification({
        eventId: id,
        eventTitle: updatedEvent.title,
        bookedUserIds: uniqueUserIds
      });
    }

    res.json(updatedEvent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const prisma = require('../utils/prisma');
const { z } = require('zod');
const backgroundJobs = require('../queue/backgroundJobs');

const bookTicketSchema = z.object({
  ticketsCount: z.number().int().positive(),
});

exports.bookTickets = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const validatedData = bookTicketSchema.parse(req.body);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.availableTickets < validatedData.ticketsCount) {
      return res.status(400).json({ error: 'Not enough available tickets' });
    }

    // Use transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Decrement available tickets
      const updatedEvent = await tx.event.update({
        where: { id: eventId },
        data: {
          availableTickets: {
            decrement: validatedData.ticketsCount,
          },
        },
      });

      // 2. Create booking
      const booking = await tx.booking.create({
        data: {
          userId: req.user.userId,
          eventId: eventId,
          ticketsCount: validatedData.ticketsCount,
        },
      });

      return { booking, updatedEvent };
    });

    // Background Task 1: Booking Confirmation
    backgroundJobs.addBookingConfirmation({
      userId: req.user.userId,
      eventId: eventId,
      bookingId: result.booking.id,
      ticketsCount: validatedData.ticketsCount,
    });

    res.status(201).json({ message: 'Tickets booked successfully', booking: result.booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const EventEmitter = require('events');

class JobQueue extends EventEmitter {
  constructor() {
    super();
    // Simulate processing by logging. Real app might send an email or push notification.
    this.on('sendBookingConfirmation', async (data) => {
      console.log(`\n[BACKGROUND JOB START] sendBookingConfirmation`);
      console.log(`Processing booking confirmation for user ${data.userId}, event ${data.eventId}...`);
      
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log(`[EMAIL SENT] Booking confirmation email sent to user ${data.userId} for ${data.ticketsCount} tickets.`);
      console.log(`[BACKGROUND JOB END] sendBookingConfirmation\n`);
    });

    this.on('sendEventUpdateNotification', async (data) => {
      console.log(`\n[BACKGROUND JOB START] sendEventUpdateNotification`);
      console.log(`Processing event update notification for event ${data.eventId}...`);
      
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log(`[NOTIFICATION SENT] Sent update notification to ${data.bookedUserIds.length} users for event ${data.eventId}.`);
      console.log(`[BACKGROUND JOB END] sendEventUpdateNotification\n`);
    });
  }

  addBookingConfirmation(data) {
    // Add job to the event loop asynchronously
    setImmediate(() => {
      this.emit('sendBookingConfirmation', data);
    });
  }

  addEventUpdateNotification(data) {
    setImmediate(() => {
      this.emit('sendEventUpdateNotification', data);
    });
  }
}

const queue = new JobQueue();
module.exports = queue;

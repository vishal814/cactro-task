# Event Booking System API

This project is a backend API for an Event Booking System. It supports two distinct user roles (Event Organizers and Customers), provides secure JSON Web Token (JWT) authentication, and features an asynchronous job queue for handling background tasks like booking confirmations and notifications.

## Design Decisions & Architecture

To complete this assignment efficiently while maintaining high standards, I made the following design choices:

1. **Database:** Used **Prisma ORM** with **PostgreSQL**. While SQLite is great for quick local tests, PostgreSQL is the standard for production deployments (like on Render, Vercel, or Railway) to prevent data loss on every restart.
2. **Data Integrity:** The ticket booking endpoint uses Prisma **Transactions**. This ensures that the decrementing of available tickets and the creation of the booking record occur atomically, preventing race conditions where tickets could be over-booked.
3. **Background Jobs (Async Processing):** Rather than implementing a heavy dependency like Redis and BullMQ, I built a custom, lightweight in-memory `JobQueue` utilizing Node.js native `EventEmitter` and `setImmediate()`.
   - **Why?** It perfectly fulfills the assignment requirement to implement an "async processing mechanism" while keeping the project entirely self-contained. The event loop is unblocked, and delays are simulated seamlessly without external infrastructure.
4. **Validation:** Used **Zod** for strict runtime request validation to ensure data consistency and prevent bad inputs.

## Setup Instructions

1. Clone or download this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Sync the SQLite database schema:
   ```bash
   npx prisma db push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Demo Instructions

To test the application quickly, you can run the included automated test script in a separate terminal while your server is running:

```bash
node test-script.js
```

This script will automatically:
- Register an Organizer and a Customer.
- Authenticate both users to retrieve JWTs.
- Create an Event as the Organizer.
- Book 2 tickets as the Customer (This triggers the **Booking Confirmation** async log in the server console).
- Update the Event as the Organizer (This triggers the **Event Update Notification** async log in the server console).

Check the terminal where your server is running to view the background job console logs!

## Tech Stack
- **Node.js & Express.js**
- **Prisma ORM**
- **SQLite**
- **Zod** (Validation)
- **JSON Web Tokens (JWT)** & **Bcrypt** (Auth)

import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createBookingSchema, updateBookingStatusSchema, cancelBookingSchema } from '../utils/booking.validation';

const router = Router();
const bookingController = new BookingController();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Book a session with a tutor
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tutorId, startTime, endTime]
 *             properties:
 *               tutorId: { type: string, format: uuid }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *               notes: { type: string }
 *               paymentRequired: { type: boolean }
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(['LEARNER']),
  validate(createBookingSchema),
  bookingController.bookSession
);

/**
 * @swagger
 * /api/bookings/me:
 *   get:
 *     summary: Get my upcoming and past bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticate, bookingController.getMyBookings);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   post:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancellationReason: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
router.post('/:id/cancel', authenticate, validate(cancelBookingSchema), bookingController.cancelBooking);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (Tutor only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [CONFIRMED, REJECTED, COMPLETED, CANCELLED, NO_SHOW] }
 *               cancellationReason: { type: string }
 *     responses:
 *       200:
 *         description: Booking status updated
 */
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles(['TUTOR', 'ADMIN']),
  validate(updateBookingStatusSchema),
  bookingController.updateStatus
);

export default router;

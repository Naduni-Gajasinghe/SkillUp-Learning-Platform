import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
const paymentController = new PaymentController();

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a payment (mock)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, paymentMethod, purpose]
 *             properties:
 *               amount: { type: number, description: "Payment amount" }
 *               paymentMethod: { type: string, description: "e.g. CARD, PAYPAL" }
 *               purpose: { type: string, description: "e.g. LESSON_PURCHASE, TUTOR_SESSION, SUBSCRIPTION" }
 *               lessonId: { type: string, format: uuid }
 *               bookingId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Payment processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Payment' }
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(['LEARNER', 'TUTOR', 'ADMIN']),
  paymentController.processPayment
);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment transaction history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Payment' }
 */
router.get(
  '/history',
  authenticate,
  paymentController.getPaymentHistory
);

/**
 * @swagger
 * /api/payments/workflow:
 *   get:
 *     summary: Get admin payment workflow summary
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/workflow',
  authenticate,
  authorizeRoles(['ADMIN']),
  paymentController.getAdminWorkflow
);

/**
 * @swagger
 * /api/payments/{id}/status:
 *   patch:
 *     summary: Update payment status (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles(['ADMIN']),
  paymentController.updatePaymentStatus
);

export default router;

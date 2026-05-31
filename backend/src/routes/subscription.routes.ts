import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
const paymentController = new PaymentController();

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get current subscription plan
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current subscription details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Subscription' }
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(['LEARNER']),
  paymentController.getSubscription
);

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Subscribe to a plan
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan]
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [BASIC, PREMIUM, PRO]
 *                 description: Subscription plan to activate
 *     responses:
 *       201:
 *         description: Subscription activated
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(['LEARNER']),
  paymentController.subscribe
);

/**
 * @swagger
 * /api/subscriptions/cancel:
 *   post:
 *     summary: Cancel current subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled
 */
router.post(
  '/cancel',
  authenticate,
  authorizeRoles(['LEARNER']),
  paymentController.cancelSubscription
);

export default router;

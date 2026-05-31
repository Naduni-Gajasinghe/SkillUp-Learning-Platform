import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const progressController = new ProgressController();

/**
 * @swagger
 * /api/progress/view/{lessonId}:
 *   post:
 *     summary: Track a lesson view (+10 gamification points)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: View tracked
 */
router.post('/view/:lessonId', authenticate, progressController.trackView);

/**
 * @swagger
 * /api/progress/complete/{lessonId}:
 *   post:
 *     summary: Mark a lesson as completed (+20 gamification points)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lesson marked as completed
 */
router.post('/complete/:lessonId', authenticate, progressController.markAsCompleted);

/**
 * @swagger
 * /api/progress/me:
 *   get:
 *     summary: Get my lesson progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Learner progress data
 */
router.get('/me', authenticate, progressController.getMyProgress);

export default router;

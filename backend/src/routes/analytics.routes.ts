import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

/**
 * @swagger
 * /api/analytics/tutor:
 *   get:
 *     summary: Get tutor-specific analytics (Earnings, Stats)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tutor analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     lessonCount: { type: integer }
 *                     totalBookings: { type: integer }
 *                     totalViews: { type: integer }
 *                     totalEarnings: { type: number }
 */
router.get(
  '/tutor',
  authenticate,
  authorizeRoles(['TUTOR', 'ADMIN']),
  analyticsController.getTutorStats
);

/**
 * @swagger
 * /api/analytics/learner:
 *   get:
 *     summary: Get learner progress analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Learner progress data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalLessons: { type: integer }
 *                     completedLessons: { type: integer }
 *                     completionRate: { type: number }
 *                     totalSubmissions: { type: integer }
 *                     reviewedSubmissions: { type: integer }
 */
router.get(
  '/learner',
  authenticate,
  authorizeRoles(['LEARNER', 'ADMIN']),
  analyticsController.getLearnerProgress
);

/**
 * @swagger
 * /api/analytics/learning-stats:
 *   get:
 *     summary: Get learner learning stats (gamification + activity)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Combined gamification and activity stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     gamification:
 *                       type: object
 *                       properties:
 *                         totalPoints: { type: integer }
 *                         streak: { type: integer }
 *                         badgesEarned: { type: integer }
 *                         achievementsUnlocked: { type: integer }
 *                     activity:
 *                       type: object
 *                       properties:
 *                         totalBookings: { type: integer }
 *                         totalSubmissions: { type: integer }
 *                         totalViews: { type: integer }
 *                         completedLessons: { type: integer }
 */
router.get(
  '/learning-stats',
  authenticate,
  authorizeRoles(['LEARNER', 'ADMIN']),
  analyticsController.getLearnerLearningStats
);

/**
 * @swagger
 * /api/analytics/platform:
 *   get:
 *     summary: Get overall platform analytics (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform-wide statistics
 */
router.get(
  '/platform',
  authenticate,
  authorizeRoles(['ADMIN']),
  analyticsController.getPlatformStats
);

export default router;

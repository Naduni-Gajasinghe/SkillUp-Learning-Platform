import { Router } from 'express';
import { GamificationController } from '../controllers/gamification.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
const gamificationController = new GamificationController();

/**
 * @swagger
 * /api/gamification/badges:
 *   get:
 *     summary: Get learner's earned badges
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of earned badges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Badge' }
 */
router.get(
  '/badges',
  authenticate,
  authorizeRoles(['LEARNER']),
  gamificationController.getBadges
);

/**
 * @swagger
 * /api/gamification/achievements:
 *   get:
 *     summary: Get learner's unlocked achievements
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of achievements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Achievement' }
 */
router.get(
  '/achievements',
  authenticate,
  authorizeRoles(['LEARNER']),
  gamificationController.getAchievements
);

/**
 * @swagger
 * /api/gamification/points:
 *   get:
 *     summary: Get learner's current points and streak
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User points data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/UserPoints' }
 */
router.get(
  '/points',
  authenticate,
  authorizeRoles(['LEARNER']),
  gamificationController.getPoints
);

/**
 * @swagger
 * /api/gamification/leaderboard:
 *   get:
 *     summary: Get points leaderboard
 *     tags: [Gamification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Number of top users to return
 *     responses:
 *       200:
 *         description: Leaderboard data
 */
router.get(
  '/leaderboard',
  authenticate,
  gamificationController.getLeaderboard
);

export default router;

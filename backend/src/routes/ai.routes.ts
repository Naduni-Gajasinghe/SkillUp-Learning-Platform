import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
const aiController = new AIController();

/**
 * @swagger
 * /api/ai/recommendations:
 *   get:
 *     summary: Get AI-powered personalized lesson recommendations
 *     tags: [AI Personalization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Recommendation' }
 */
router.get(
  '/recommendations',
  authenticate,
  authorizeRoles(['LEARNER']),
  aiController.getRecommendations
);

/**
 * @swagger
 * /api/ai/skill-assessment:
 *   post:
 *     summary: Perform an AI-powered skill gap assessment
 *     tags: [AI Personalization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skills:
 *                 type: object
 *                 description: Key-value pairs of skill names and self-assessed levels (0-100)
 *                 example: { "JavaScript": 70, "Python": 45, "React": 60 }
 *     responses:
 *       201:
 *         description: Skill assessment result with feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/SkillAssessment' }
 */
router.post(
  '/skill-assessment',
  authenticate,
  authorizeRoles(['LEARNER']),
  aiController.performSkillAssessment
);

/**
 * @swagger
 * /api/ai/learning-path:
 *   get:
 *     summary: Get AI-generated custom learning path
 *     tags: [AI Personalization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Custom learning path
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/LearningPath' }
 */
router.get(
  '/learning-path',
  authenticate,
  authorizeRoles(['LEARNER']),
  aiController.getLearningPath
);

export default router;

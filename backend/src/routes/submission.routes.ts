import { Router } from 'express';
import { SubmissionController } from '../controllers/submission.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
const submissionController = new SubmissionController();

/**
 * @swagger
 * /api/submissions/my-submissions:
 *   get:
 *     summary: Get logged-in learner's submissions
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of learner's submissions with review status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Submission' }
 */
router.get(
  '/my-submissions',
  authenticate,
  authorizeRoles(['LEARNER']),
  submissionController.getMySubmissions
);

export default router;

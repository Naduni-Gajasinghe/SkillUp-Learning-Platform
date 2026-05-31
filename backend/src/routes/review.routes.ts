import { Router } from 'express';
import { SubmissionController } from '../controllers/submission.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
const submissionController = new SubmissionController();

/**
 * @swagger
 * /api/reviews/{submissionId}:
 *   get:
 *     summary: Get review/feedback for a submission
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Submission or review not found
 */
router.get(
  '/:submissionId',
  authenticate,
  authorizeRoles(['LEARNER']),
  submissionController.getReview
);

export default router;

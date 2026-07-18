import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { updateTutorVerificationSchema } from '../utils/admin.validation';

const router = Router();
const adminController = new AdminController();

/**
 * @swagger
 * /api/admin/tutors/pending:
 *   get:
 *     summary: Get pending tutor applications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/tutors/pending', authenticate, authorizeRoles(['ADMIN']), adminController.getPendingTutorApplications);

/**
 * Get a tutor profile and analytics (Admin)
 */
router.get('/tutors/:id', authenticate, authorizeRoles(['ADMIN']), adminController.getTutorOverview);

/**
 * @swagger
 * /api/admin/tutors/{id}/verification:
 *   patch:
 *     summary: Approve or reject a tutor application
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/tutors/:id/verification',
  authenticate,
  authorizeRoles(['ADMIN']),
  validate(updateTutorVerificationSchema),
  adminController.updateTutorVerificationStatus
);

export default router;
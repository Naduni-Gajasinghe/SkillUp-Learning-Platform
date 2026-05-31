import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { profileUpload } from '../middlewares/upload.middleware';

const router = Router();
const profileController = new ProfileController();

/**
 * @swagger
 * /api/profiles/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/User' }
 */
router.get('/me', authenticate, profileController.getMyProfile);

/**
 * @swagger
 * /api/profiles/me:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/LearnerProfile'
 *               - $ref: '#/components/schemas/TutorProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch('/me', authenticate, profileUpload.single('profileImage'), profileController.updateMyProfile);

/**
 * @swagger
 * /api/profiles/tutors:
 *   get:
 *     summary: Get all available tutor profiles
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: List of tutors retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/TutorProfile' }
 */
router.get('/tutors', profileController.getTutorProfiles);

export default router;

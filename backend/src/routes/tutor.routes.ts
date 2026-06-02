import { Router } from 'express';
import { TutorController } from '../controllers/tutor.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createAvailabilitySchema, updateAvailabilitySchema } from '../utils/availability.validation';

const router = Router();
const tutorController = new TutorController();

/**
 * @swagger
 * /api/tutors/availability/slots:
 *   post:
 *     summary: Create an availability slot for a tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dayOfWeek, startTime, endTime]
 *             properties:
 *               dayOfWeek: { type: number, description: 'Day of week 0-6 (Sunday-Saturday)' }
 *               startTime: { type: string, description: 'Start time in HH:MM format' }
 *               endTime: { type: string, description: 'End time in HH:MM format' }
 *     responses:
 *       201:
 *         description: Availability slot created
 */
router.post(
  '/availability/slots',
  authenticate,
  authorizeRoles(['TUTOR']),
  validate(createAvailabilitySchema),
  tutorController.createAvailability
);

/**
 * @swagger
 * /api/tutors/availability/{id}:
 *   patch:
 *     summary: Update an availability slot for a tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dayOfWeek: { type: number }
 *               startTime: { type: string }
 *               endTime: { type: string }
 *     responses:
 *       200:
 *         description: Availability slot updated
 */
router.patch(
  '/availability/:id',
  authenticate,
  authorizeRoles(['TUTOR']),
  validate(updateAvailabilitySchema),
  tutorController.updateAvailability
);

/**
 * @swagger
 * /api/tutors/availability/{id}:
 *   delete:
 *     summary: Delete an availability slot for a tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Availability slot deleted
 */
router.delete(
  '/availability/:id',
  authenticate,
  authorizeRoles(['TUTOR']),
  tutorController.deleteAvailability
);

/**
 * @swagger
 * /api/tutors/me/availability:
 *   get:
 *     summary: Get current tutor's availability slots
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current tutor's availability slots
 */
router.get('/me/availability', authenticate, authorizeRoles(['TUTOR']), tutorController.getMyAvailability);

/**
 * @swagger
 * /api/tutors:
 *   get:
 *     summary: List all verified tutors
 *     tags: [Tutors]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name or expertise
 *       - in: query
 *         name: expertise
 *         schema: { type: string }
 *         description: Filter by expertise area
 *     responses:
 *       200:
 *         description: List of tutors
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
router.get('/', tutorController.getAll);

/**
 * @swagger
 * /api/tutors/{id}:
 *   get:
 *     summary: Get a tutor's profile, lessons, and availability
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Tutor profile with availability
 *       404:
 *         description: Tutor not found
 */
router.get('/:id', tutorController.getOne);

/**
 * @swagger
 * /api/tutors/{id}/availability:
 *   get:
 *     summary: Get tutor availability slots
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Availability slots
 */
router.get('/:id/availability', tutorController.getAvailability);

export default router;

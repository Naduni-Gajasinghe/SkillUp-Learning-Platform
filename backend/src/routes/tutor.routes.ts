import { Router } from 'express';
import { TutorController } from '../controllers/tutor.controller';

const router = Router();
const tutorController = new TutorController();

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

import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';
import { authenticate, authorizeRoles, optionalAuthenticate } from '../middlewares/auth.middleware';
import { lessonUpload } from '../middlewares/upload.middleware';

const router = Router();
const lessonController = new LessonController();

/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Create a new lesson (Tutor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, categoryId]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               categoryId: { type: string, format: uuid }
 *               difficulty: { type: string, enum: [BEGINNER, INTERMEDIATE, ADVANCED] }
 *               contentType: { type: string, enum: [VIDEO, PDF, TEXT] }
 *               isPremium: { type: boolean }
 *               tags: { type: string, description: "Comma-separated tags" }
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Lesson' }
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(['TUTOR', 'ADMIN']),
  lessonUpload.single('file'),
  lessonController.create
);

/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Get all lessons with filters
 *     tags: [Lessons]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: difficulty
 *         schema: { type: string, enum: [BEGINNER, INTERMEDIATE, ADVANCED] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of lessons retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Lesson' }
 */
router.get('/', optionalAuthenticate, lessonController.getAll);

/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Get a lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lesson found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Lesson' }
 *       404:
 *         description: Lesson not found
 */
router.get('/:id', optionalAuthenticate, lessonController.getOne);

/**
 * @swagger
 * /api/lessons/{id}:
 *   patch:
 *     summary: Update a lesson (Tutor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               categoryId: { type: string, format: uuid }
 *               difficulty: { type: string, enum: [BEGINNER, INTERMEDIATE, ADVANCED] }
 *               contentType: { type: string, enum: [VIDEO, PDF, TEXT] }
 *               isPremium: { type: boolean }
 *               tags: { type: string, description: "Comma-separated tags" }
 *               file: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Lesson' }
 */
router.patch(
  '/:id',
  authenticate,
  authorizeRoles(['TUTOR', 'ADMIN']),
  lessonUpload.single('file'),
  lessonController.update
);

/**
 * @swagger
 * /api/lessons/{id}:
 *   delete:
 *     summary: Delete a lesson (Tutor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *       404:
 *         description: Lesson not found
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles(['TUTOR', 'ADMIN']),
  lessonController.delete
);

export default router;

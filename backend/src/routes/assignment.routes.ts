import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { assignmentUpload, submissionUpload } from '../middlewares/upload.middleware';

const router = Router();
const assignmentController = new AssignmentController();

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Create a new assignment (Tutor only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               lessonId: { type: string, format: uuid }
 *               dueDate: { type: string, format: date-time }
 *               assignment: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Assignment created
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(['TUTOR', 'ADMIN']),
  assignmentUpload.single('assignment'),
  assignmentController.createAssignment
);

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get all assignments
 *     tags: [Assignments]
 */
router.get('/', assignmentController.getAssignments);

/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: Get assignment by ID
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 */
router.get('/:id', assignmentController.getOne);

/**
 * @swagger
 * /api/assignments/{id}:
 *   patch:
 *     summary: Update an assignment (Tutor only)
 *     tags: [Assignments]
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
 *               lessonId: { type: string, format: uuid }
 *               dueDate: { type: string, format: date-time }
 *               assignment: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Assignment updated
 */
router.patch(
  '/:id',
  authenticate,
  authorizeRoles(['TUTOR', 'ADMIN']),
  assignmentUpload.single('assignment'),
  assignmentController.updateAssignment
);

/**
 * @swagger
 * /api/assignments/{id}:
 *   delete:
 *     summary: Delete an assignment (Tutor only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Assignment deleted
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles(['TUTOR', 'ADMIN']),
  assignmentController.deleteAssignment
);

/**
 * @swagger
 * /api/assignments/{assignmentId}/submit:
 *   post:
 *     summary: Submit work for an assignment (Learner only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:assignmentId/submit',
  authenticate,
  authorizeRoles(['LEARNER']),
  submissionUpload.single('submission'),
  assignmentController.submitWork
);

/**
 * @swagger
 * /api/assignments/{assignmentId}/submissions:
 *   get:
 *     summary: Get all submissions for an assignment (Tutor only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:assignmentId/submissions',
  authenticate,
  authorizeRoles(['TUTOR', 'ADMIN']),
  assignmentController.getSubmissions
);

/**
 * @swagger
 * /api/submissions/{submissionId}/review:
 *   post:
 *     summary: Review and grade a submission (Tutor only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/submissions/:submissionId/review',
  authenticate,
  authorizeRoles(['TUTOR', 'ADMIN']),
  assignmentController.reviewSubmission
);

export default router;

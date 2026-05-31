import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createCategorySchema } from '../utils/category.validation';

const router = Router();
const categoryController = new CategoryController();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all lesson categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Category' }
 */
router.get('/', categoryController.getAll);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Category created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, authorizeRoles('TUTOR', 'ADMIN'), validate(createCategorySchema), categoryController.create);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a category by ID with its lessons
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Category found
 *       404:
 *         description: Category not found
 */
router.get('/:id', categoryController.getOne);

export default router;

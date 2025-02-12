import { RequestHandler, Router } from "express";
import  {
    getAllCategories,
    getCategoryById, 
    createCategory, 
    updateCategory } from "../controllers/categoryController"
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Категории продуктов
 */

/**
 * @swagger
 * /api/menu/categories:
 *   get:
 *     summary: Получить все категории
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Список категорий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get("/categories", getAllCategories);
/**
 * @swagger
 * /api/menu/categories/{id}:
 *   get:
 *     summary: Получить категорию по ID
 *     tags: [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID категории
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Категория найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Категория не найдена
 */
router.get("/categories/:id", getCategoryById as RequestHandler);
/**
 * @swagger
 * /api/menu/categories:
 *   post:
 *     summary: Создать новую категорию (Только для ADMIN)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Напитки"
 *     responses:
 *       201:
 *         description: Категория создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       401:
 *         description: Неавторизованный пользователь
 *       403:
 *         description: Недостаточно прав
 */
router.post("/categories", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, createCategory);
/**
 * @swagger
 * /api/menu/categories/{id}:
 *   put:
 *     summary: Обновить категорию (Только для ADMIN)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID категории
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Горячие напитки"
 *     responses:
 *       200:
 *         description: Категория обновлена
 *       401:
 *         description: Неавторизованный пользователь
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Категория не найдена
 */
router.put("/categories/:id", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, updateCategory);

export default router;

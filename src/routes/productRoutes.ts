import { RequestHandler, Router } from "express";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Действия с позициями меню
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Кофе"
 *         price:
 *           type: number
 *           example: 4.99
 *         categoryId:
 *           type: integer
 *           example: 2
 *         description:
 *           type: string
 *           example: "Ароматный черный кофе"
 *         img:
 *           type: string
 *           example: "https://example.com/image.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-02-09T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-02-10T12:30:00.000Z"
 */

/**
 * @swagger
 * /api/menu/product:
 *   get:
 *     summary: Получить список всех продуктов
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список всех продуктов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/product", getAllProducts);
/**
 * @swagger
 * /api/menu/product/{id}:
 *   get:
 *     summary: Получить продукт по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Данные продукта
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Продукт не найден
 */
router.get("/product/:id", getProductById as RequestHandler);

/**
 * @swagger
 * /api/menu/product:
 *   post:
 *     summary: Создать новый продукт (только для ADMIN)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Капучино"
 *               price:
 *                 type: number
 *                 example: 5.99
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               description:
 *                 type: string
 *                 example: "Кофе с молоком"
 *               img:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Продукт создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Категория не найдена
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен
 */
router.post("/product", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, createProduct as RequestHandler);

/**
 * @swagger
 * /api/menu/product/{id}:
 *   put:
 *     summary: Обновить продукт по ID (только для ADMIN)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID продукта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Капучино"
 *               price:
 *                 type: number
 *                 example: 5.99
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               description:
 *                 type: string
 *                 example: "Кофе с молоком"
 *               img:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       200:
 *         description: Продукт обновлён
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Продукт обновлён"
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 categoryId:
 *                   type: integer
 *                 description:
 *                   type: string
 *                 img:
 *                   type: string
 *       400:
 *         description: Неверный ID продукта
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Продукт не найден
 */
router.put("/product/:id", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, updateProduct as RequestHandler);

/**
 * @swagger
 * /api/menu/product/{id}:
 *   delete:
 *     summary: Удалить продукт по ID (только для ADMIN)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Продукт удалён
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Продукт удалён"
 *       400:
 *         description: Неверный ID продукта
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Продукт не найден
 */
router.delete("/product/:id", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, deleteProduct as RequestHandler);

export default router;

import { RequestHandler, Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { createOrder, getOrders, updateOrder, deleteOrder  } from "../controllers/orderController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Действия с заказами
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         orderId:
 *           type: integer
 *         productId:
 *           type: integer
 *         quantity:
 *           type: integer
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         status:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Создать заказ
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Заказ успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Неверные данные запроса
 *       401:
 *         description: Неавторизованный доступ
 *       403:
 *         description: Администратор не может создавать заказы
 */
router.post("/", authenticate as RequestHandler, createOrder as RequestHandler);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Получить список заказов
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список заказов (пользователь видит только свои, админ все)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Неавторизованный доступ
 */
router.get("/", authenticate as RequestHandler, getOrders as RequestHandler);

/**
 * @swagger
 * /orders/{orderId}:
 *   put:
 *     summary: Обновить статус заказа (только администратор)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Заказ успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Неавторизованный доступ
 *       403:
 *         description: Нет прав на редактирование
 *       404:
 *         description: Заказ не найден
 */
router.put("/:orderId", authenticate as RequestHandler, updateOrder as RequestHandler);


/**
 * @swagger
 * /orders/{orderId}:
 *   delete:
 *     summary: Удалить заказ (только администратор)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Заказ успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Неавторизованный доступ
 *       403:
 *         description: Нет прав на удаление
 *       404:
 *         description: Заказ не найден
 */
router.delete("/:orderId", authenticate as RequestHandler, deleteOrder as RequestHandler);

export default router;

import express, { RequestHandler } from "express";
import { register } from "../controllers/register";
import { login } from "../controllers/login";
import { authenticate } from "../middleware/authMiddleware";
import { logout } from "../controllers/logout";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Авторизация и регистрация пользователей
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "StrongPass123"
 *               role:
 *                 type: string
 *                 enum: ["USER", "ADMIN"]
 *                 example: "USER"
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Ошибка валидации (например, не все обязательные поля заполнены)
 *       409:
 *         description: Пользователь с таким email уже существует
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/register", register as RequestHandler);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "StrongPass123"
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 username:
 *                   type: string
 *                   example: "john_doe"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsIn..."
 *                 role:
 *                   type: string
 *                   example: "USER"
 *       400:
 *         description: Неверные учетные данные (неверный пароль или пользователь не найден)
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Выход из системы
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный выход
 *       401:
 *         description: Пользователь не авторизован
 */
router.post("/logout", authenticate as RequestHandler, logout as RequestHandler);


export default router;

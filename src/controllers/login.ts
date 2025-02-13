import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {User} from "../models/User";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток
  message: { error: "Too many login attempts, please try again later" },
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📌 Попытка входа:", req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    const sanitizedUsername = sanitizeHtml(username);
    const user = await User.findOne({ where: { username: sanitizedUsername } });
    if (!user) {
      console.log("❌ Пользователь не найден");
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Неверный пароль");
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7h" }
    );

    console.log("✅ Вход успешен");
    res.json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    console.error("❌ Ошибка в login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



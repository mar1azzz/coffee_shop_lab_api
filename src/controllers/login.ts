import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {User} from "../models/User";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📌 Попытка входа:", req.body);
    const { email, password } = req.body;

    // Проверяем, существует ли пользователь
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("❌ Пользователь не найден");
      res.status(400).json({ error: "User not found" });
      return;
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Неверный пароль");
      res.status(400).json({ error: "Invalid password" });
      return;
    }

    // Генерируем JWT-токен
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7h" }
    );

    console.log("✅ Вход успешен, токен:", token);
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("❌ Ошибка в login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


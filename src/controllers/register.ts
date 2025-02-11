import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {User} from "../models/User";
import { UniqueConstraintError } from "sequelize";

export const register = async (req: Request, res: Response) => {
  try {
    console.log("📌 Получены данные:", req.body);
    const { username, email, password, role } = req.body;

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Пароль захеширован");

    // Создаем пользователя
    const newUser = await User.create({ username, email, password: hashedPassword, role: role.toUpperCase() });
    console.log("✅ Пользователь создан:", newUser.toJSON());

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error: any) {
    console.error("❌ Ошибка в register:", error);

    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        error: "User with this email already exists",
        details: error.errors.map(e => e.message),
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};


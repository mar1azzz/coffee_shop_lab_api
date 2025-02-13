import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {User} from "../models/User";
import { UniqueConstraintError } from "sequelize";
import Joi from "joi";
import sanitizeHtml from "sanitize-html";

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(50).required(),
  role: Joi.string().valid("USER", "ADMIN").default("USER"),
});

export const register = async (req: Request, res: Response) => {
  try {
    console.log("📌 Получены данные:", req.body);
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password, role } = value;
    const sanitizedUsername = sanitizeHtml(username);
    const sanitizedEmail = sanitizeHtml(email);

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Пароль захеширован");

    // Создаем пользователя
    const newUser = await User.create({
      username: sanitizedUsername,
      email: sanitizedEmail,
      password: hashedPassword,
      role,
    });

    console.log("✅ Пользователь создан:", newUser.toJSON());
    res.status(201).json({ message: "User created successfully" });
  } catch (error: any) {
    console.error("❌ Ошибка в register:", error);
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        error: "User with this email already exists",
        details: error.errors.map((e) => e.message),
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};


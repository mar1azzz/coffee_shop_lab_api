import { Response } from "express";
import { AuthRequest } from "../types/express";

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Пользователь не авторизован" });
    }

    console.log("📌 Пользователь выходит:", req.user);

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("❌ Ошибка при logout:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

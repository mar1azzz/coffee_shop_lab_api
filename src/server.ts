import express from "express";
import { sequelize } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Подключение к базе данных успешно!");
  })
  .catch((err) => {
    console.error("❌ Ошибка подключения к базе данных:", err);
  });

sequelize
  .sync({ alter: true }) // Альтерируем таблицы, если нужно
  .then(() => {
    console.log("✅ База данных синхронизирована!");
  })
  .catch((err: Error) => {
    console.error("❌ Ошибка синхронизации БД:", err.message);
  }); 

app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));

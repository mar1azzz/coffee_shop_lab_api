import express from "express";
import { sequelize } from "./config/db";
import dotenv from "dotenv";
//import cors from "cors";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
//app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", productRoutes);
app.use("/api/menu", categoryRoutes);
app.use("/api/orders", orderRoutes);

// Подключение к базе
sequelize
  .authenticate()
  .then(() => console.log("✅ Подключение к базе данных успешно!"))
  .catch((err) => console.error("❌ Ошибка подключения к базе данных:", err));

sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ База данных синхронизирована!"))
  .catch((err: Error) => console.error("❌ Ошибка синхронизации БД:", err.message));

app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));

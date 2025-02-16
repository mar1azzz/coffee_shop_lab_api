import express from "express";
import { sequelize } from "./config/db";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import { setupSwagger } from "./config/swagger";

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ 
  origin: ["http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"], 
  credentials: true 
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", productRoutes);
app.use("/api/menu", categoryRoutes);
app.use("/api/orders", orderRoutes);

setupSwagger(app);

// Подключение к базе
sequelize
  .authenticate()
  .then(() => console.log("✅ Подключение к базе данных успешно!"))
  .catch((err) => console.error("❌ Ошибка подключения к базе данных:", err));

sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ База данных синхронизирована!"))
  .catch((err: Error) => console.error("❌ Ошибка синхронизации БД:", err.message));

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
}

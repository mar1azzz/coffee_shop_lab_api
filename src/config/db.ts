import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { OrderItem } from "../models/OrderItem";
import { Order } from "../models/Order";
import { Category } from "../models/Category";

dotenv.config();
const isTestEnv = process.env.NODE_ENV === "test";

export const sequelize = new Sequelize({
  dialect: isTestEnv ? "sqlite" : "postgres",
  storage: isTestEnv ? ":memory:" : undefined,
  database: isTestEnv ? undefined : process.env.DB_NAME,
  username: isTestEnv ? undefined : process.env.DB_USER,
  password: isTestEnv ? undefined : process.env.DB_PASS,
  host: isTestEnv ? undefined : process.env.DB_HOST,
  models: [User, Category, Product, OrderItem, Order],
});


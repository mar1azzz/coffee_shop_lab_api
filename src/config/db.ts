import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { OrderItem } from "../models/OrderItem";
import { Order } from "../models/Order";
import { Category } from "../models/Category";

dotenv.config();

export const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  dialect: "postgres",
  models: [User, Category, Product, OrderItem, Order],
});

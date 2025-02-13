import { Request, Response } from "express";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Product } from "../models/Product";
import { AuthRequest } from "../types/express";
import Joi from "joi";

const orderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
      })
    )
    .min(1)
    .required(),
});

// Создать заказ (только пользователь)
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    console.log("Authenticated user:", req.user);
    if (!req.user) {
        return res.status(401).json({ message: "Неавторизованный доступ" });
      } 
    if (req.user.role === "ADMIN") {
      return res.status(403).json({ message: "Администраторы не могут создавать заказы" });
    }

    const { error } = orderSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Добавьте хотя бы один товар" });
    }

    console.log("User ID from request:", req.user?.id);

    const user_id = parseInt(req.params.id, 10);
    if (isNaN(user_id)) {
      return res.status(400).json({ error: "Некорректный ID" });
    }

    const order = await Order.create({ userId: user_id });

    const orderItems = await Promise.all(
      items.map(async (item: { productId: number; quantity: number }) => {
        const product = await Product.findByPk(item.productId);
        if (!product) {
          throw new Error(`Продукт с id ${item.productId} не найден`);
        }
        return OrderItem.create({ orderId: order.id, productId: item.productId, quantity: item.quantity });
      })
    );

    res.status(201).json({ order, items: orderItems });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Получить заказы (пользователь видит только свои, админ все)
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: "Неавторизованный доступ" });
    }
    const whereClause = req.user.role === "ADMIN" ? {} : { userId: req.user.id };
    const orders = await Order.findAll({
      where: whereClause,
      include: [{ model: OrderItem, include: [Product] }]
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Обновить статус заказа (только админ)
export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: "Неавторизованный доступ" });
    }
    const { orderId } = req.params;
    const id = parseInt(orderId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Некорректный ID заказа" });
    }    
    const { status } = req.body;
    
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Заказ не найден" });

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Нет доступа для редактирования" });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Удалить заказ (только админ)
export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: "Неавторизованный доступ" });
    }
    
    const { orderId } = req.params;
    const id = parseInt(orderId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Некорректный ID заказа" });
    }
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Заказ не найден" });

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Нет доступа для удаления" });
    }

    await order.destroy();
    res.json({ message: "Заказ удалён" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

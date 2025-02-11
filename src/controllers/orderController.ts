import { Request, Response } from "express";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Product } from "../models/Product";
import { AuthRequest } from "../types/express";

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

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Добавьте хотя бы один товар" });
    }

    console.log("User ID from request:", req.user?.id);

    const order = await Order.create({ userId: req.user.id });

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
    const { status } = req.body;
    
    const order = await Order.findByPk(orderId);
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

    const order = await Order.findByPk(orderId);
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

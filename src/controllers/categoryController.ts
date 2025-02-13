import { Request, Response } from "express";
import { Category } from "../models/Category";
import Joi from "joi";
import { Product } from "../models/Product";

// Схема валидации
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
});

// Получение всех категорий
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Получение категории по ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Некорректный ID" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: "Категория не найдена" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Создание новой категории
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name } = req.body;
    
    // Проверка на дублирование категории (опционально)
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(409).json({ error: "Категория с таким названием уже существует" });
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Обновление категории
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name } = req.body;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Некорректный ID" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: "Категория не найдена" });
    }

    await category.update({ name });
    res.json({ message: "Категория обновлена", category });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Удаление категории и связанных товаров
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Некорректный ID" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: "Категория не найдена" });
    }

    // Удаляем все продукты, связанные с категорией
    await Product.destroy({ where: { categoryId: id } });
    
    // Удаляем категорию
    await category.destroy();
    res.json({ message: "Категория и все связанные товары удалены" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

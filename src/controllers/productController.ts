import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import Joi from "joi";
import sanitizeHtml from "sanitize-html";

const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().positive().required(),
  categoryId: Joi.number().integer().positive().required(),
  description: Joi.string().max(500).allow(""),
  img: Joi.string().uri().allow(""),
});

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({ include: [{ model: Category, attributes: ["name"] }] });
    res.json(products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
      description: product.description,
      img: product.img,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryName: product.category ? product.category.name : null,
    })));
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Некорректный ID" });
    
    const product = await Product.findByPk(id, { include: [{ model: Category, attributes: ["name"] }] });
    if (!product) return res.status(404).json({ error: "Продукт не найден" });

    res.json({
      id: product.id,
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
      description: product.description,
      img: product.img,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryName: product.category ? product.category.name : null,
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    const { name, price, categoryId, description, img } = req.body;
    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(400).json({ error: "Категория не найдена" });

    const sanitizedData = {
      name: sanitizeHtml(name),
      price,
      categoryId,
      description: sanitizeHtml(description),
      img: sanitizeHtml(img),
    };

    const product = await Product.create(sanitizedData);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Некорректный ID" });
    
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    const { name, price, categoryId, description, img } = req.body;
    const sanitizedData = {
      name: sanitizeHtml(name),
      price,
      categoryId,
      description: sanitizeHtml(description),
      img: sanitizeHtml(img),
    };

    const [updated] = await Product.update(sanitizedData, { where: { id } });
    if (!updated) return res.status(404).json({ error: "Продукт не найден" });

    res.json({ message: "Продукт обновлён", ...sanitizedData });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Некорректный ID" });
    
    const deleted = await Product.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Продукт не найден" });
    
    res.json({ message: "Продукт удалён" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

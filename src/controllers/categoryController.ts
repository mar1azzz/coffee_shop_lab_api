import { Request, Response } from "express";
import { Category } from "../models/Category";

export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await Category.findAll();
  res.json(categories);
};

export const getCategoryById = async (req: Request, res: Response) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: "Категория не найдена" });
  res.json(category);
};

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  const category = await Category.create({ name });
  res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  await Category.update({ name }, { where: { id: req.params.id } });
  res.json({ message: "Категория обновлена" });
};
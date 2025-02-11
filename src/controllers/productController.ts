import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";

export const getAllProducts = async (req: Request, res: Response) => {
  const products = await Product.findAll({ include: [{ model: Category, attributes: ['name'] }] });

  const formattedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    categoryId: product.categoryId,
    description: product.description,
    img: product.img,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    categoryName: product.category ? product.category.name : null
  }));

  res.json(formattedProducts);
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await Product.findByPk(req.params.id, { include: [{ model: Category, attributes: ['name'] }] });

  if (!product) return res.status(404).json({ error: "Продукт не найден" });

  const formattedProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    categoryId: product.categoryId,
    description: product.description,
    img: product.img,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    categoryName: product.category ? product.category.name : null
  };

  res.json(formattedProduct);
};


export const createProduct = async (req: Request, res: Response) => {
  const { name, price, categoryId, description, img } = req.body;
  const category = await Category.findByPk(categoryId);
  if (!category) return res.status(400).json({ error: "Категория не найдена" });
  const product = await Product.create({ name, price, categoryId, description, img });
  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
  
    const { name, price, categoryId, description, img } = req.body;
     await Product.update({ name, price, categoryId, description, img }, { where: { id } });
    res.json({ message: "Продукт обновлён" , name, price, categoryId, description, img });
  };
  
  export const deleteProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
  
    await Product.destroy({ where: { id } });
    res.json({ message: "Продукт удалён" });
  };

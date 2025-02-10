import { Request, Response } from "express";
import { Product } from "../models/Product";

export const getAllProducts = async (req: Request, res: Response) => {
  const products = await Product.findAll();
  res.json(products);
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, price } = req.body;
  const product = await Product.create({ name, price });
  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
  
    const { name, price } = req.body;
     await Product.update({ name, price }, { where: { id } });
    res.json({ message: "Продукт обновлён" , name, price });
  };
  
  export const deleteProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
  
    await Product.destroy({ where: { id } });
    res.json({ message: "Продукт удалён" });
  };

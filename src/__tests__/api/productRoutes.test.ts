import request from "supertest";
import { app } from "../../server";
import { sequelize } from "../../config/db";
import { Product } from "../../models/Product";
import { User } from "../../models/User";
import bcrypt from "bcrypt";
import { Category } from "../../models/Category";

describe("Product API Integration Tests", () => {
  let validToken: any;
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    await User.create({ username: "testadmin", password: hashedPassword, role: "ADMIN" });

    const adminLoginRes = await request(app).post("/api/auth/login").send({
      username: "testadmin",
      password: "testpassword",
    });

    validToken = adminLoginRes.body.token;
  });

  afterEach(async () => {
    await Product.destroy({ where: {} });
  });

  describe("GET /api/menu/products", () => {
    it("должен вернуть пустой массив при отсутствии продуктов", async () => {
      const res = await request(app).get("/api/menu/product");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("должен вернуть список продуктов", async () => {
      await Category.create({ name: "Test Category" });
      await Product.create({ 
        "name": "Капучино",
        "price": 5.99,
        "categoryId": 1,
        "description": "Кофе с молоком",
        "img": "https://example.com/image.jpg"
      });
      const res = await request(app).get("/api/menu/product");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("Капучино");
    });
  });

  describe("POST /api/menu/product", () => {
    it("должен создать новый продукт", async () => {
      await Category.create({ name: "Test Category" })
      const res = await request(app)
        .post("/api/menu/product")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ name: "New Product",
          price: 15.5,
          "categoryId": 1,
          "description": "Кофе с молоком",
          "img": "https://example.com/image.jpg"
         });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe("New Product");
    });
  });

  describe("GET /api/menu/product/:id", () => {
    it("должен вернуть продукт по ID", async () => {
      await Category.create({ name: "Test Category" });
      const product = await Product.create({ 
        name: "New Product",
        price: 15.5,
        "categoryId": 1,
        "description": "Кофе с молоком",
        "img": "https://example.com/image.jpg"
      });
      const res = await request(app).get(`/api/menu/product/${product.id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("New Product");
    });
  });

  describe("PUT /api/menu/product/:id", () => {
    it("должен обновить продукт", async () => {
      const category = await Category.create({ name: "Test Category" });
      const product = await Product.create({ 
        name: "Old Name",
        price: 9.99,
        "categoryId": category.dataValues.id,
        "description": "Кофе с молоком",
        "img": "https://example.com/image.jpg"
      });
      const res = await request(app)
        .put(`/api/menu/product/${product.dataValues.id}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ 
          name: "Updated Name",
          price: 5.99,
          categoryId: product.dataValues.id,
          description: "Кофе с молоком",
          img: "https://example.com/image.jpg"
        });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Продукт обновлён");
    });
  });

  describe("DELETE /api/menu/product/:id", () => {
    it("должен удалить продукт", async () => {
      const category = await Category.create({ name: "Test Category" });
      const product = await Product.create({ 
        name: "To Be Deleted",
        price: 7.99,
        categoryId: category.dataValues.id,
        description: "Кофе с молоком",
        img: "https://example.com/image.jpg"
      });
      const res = await request(app)
        .delete(`/api/menu/product/${product.dataValues.id}`)
        .set("Authorization", `Bearer ${validToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Продукт удалён");
    });
  });
});
import request from "supertest";
import {app} from "../../server";
import { Product } from "../../models/Product";
import { Category } from "../../models/Category";
import bcrypt from "bcrypt";
import { User } from "../../models/User";

jest.mock("../../models/Product", () => ({
    Product: {
      findAll: jest.fn().mockResolvedValue([
        { id: 1, name: "Test Product", price: 10 },
      ]),
      findByPk: jest.fn().mockResolvedValue({ id: 1, name: "Test Product", price: 10 }),
      create: jest.fn().mockResolvedValue({ id: 1, name: "Test Product", price: 10 }),
      update: jest.fn().mockResolvedValue([1]),
      destroy: jest.fn().mockResolvedValue(1),
    },
}));
  
jest.mock("../../models/Category");

let mockProduct: any;
let mockCategory: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProduct = { 
        id: 1,
        name: "Espresso",
        price: 2.5,
        categoryId: 1,
        description: "Strong coffee",
        img: "", createdAt: new Date(),
        updatedAt: new Date(),
        category: { name: "Drinks" }
    };

    mockCategory = {
        id: 1,
        name: "Drinks"
    };
  });

describe("Product Controller", () => {
  let token: any;

  beforeAll(async () => {
    // Создаем тестового пользователя
        const hashedPassword = await bcrypt.hash("testpassword", 10);
        await User.create({
          username: "testadmin",
          password: hashedPassword,
          role: "ADMIN",
        });

        await Category.create({
            name: "Drinks",
        });
    
        // Логинимся, чтобы получить токен
        const loginRes = await request(app).post("/api/auth/login").send({
          username: "testadmin",
          password: "testpassword",
        });
    
        token = loginRes.body.token;
  });

  describe("GET /api/menu/product", () => {
    it("should return a list of products", async () => {
      (Product.findAll as jest.Mock).mockResolvedValue([{ ...mockProduct}]);
      
      const res = await request(app).get("/api/menu/product");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe("Espresso");
    });

    it("должен вернуть 500 при ошибке сервера", async () => {
        (Product.findAll as jest.Mock).mockRejectedValue(new Error());
    
        const res = await request(app).get("/api/menu/product");
    
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: "Ошибка сервера" });
    });
  });

  describe("GET /api/menu/product/:id", () => {
    it("should return a product by ID", async () => {
      (Product.findByPk as jest.Mock).mockResolvedValue({ ...mockProduct });
      
      const res = await request(app).get("/api/menu/product/1");
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Espresso");
    });

    it("должен вернуть 400 при некорректном ID", async () => {
        const res = await request(app).get("/api/menu/product/abc");
    
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: "Некорректный ID" });
    });

    it("should return 404 if product not found", async () => {
      (Product.findByPk as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get("/api/menu/product/999");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/menu/product", () => {
    it("should create a new product", async () => {
      // Мокаем создание категории перед тестом
      (Category.create as jest.Mock).mockResolvedValue(mockCategory);
      (Category.findByPk as jest.Mock).mockImplementation(async (id) => {
        return id === 1 ? mockCategory : null;
      });
  
      // Создаем категорию
      await request(app).post("/api/menu/categories").send({ name: "Test Category" });
  
      // Мокаем создание продукта
      (Product.create as jest.Mock).mockImplementation(async (data) => {
        return { ...mockProduct, ...data };
      });
  
      const res = await request(app)
        .post("/api/menu/product")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Espresso", price: 3.5, categoryId: 1, description: "Foamy coffee", img: "" });
  
      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Espresso");
    });

    it("должен вернуть 400 при невалидных данных", async () => {
        const res = await request(app)
        .post("/api/menu/product").send({ name: "", price: 0, categoryId: 0, description: "", img: "" })
        .set("Authorization", `Bearer ${token}`);
    
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
    });
  });
  
  

  describe("PUT /api/menu/product/:id", () => {
    it("should update an existing product", async () => {
      (Product.findByPk as jest.Mock).mockResolvedValue({ update: jest.fn() });
      const res = await request(app)
        .put("/api/menu/product/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Cappuccino", price: 3.5, categoryId: 1, description: "Foamy coffee", img: "" });
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Продукт обновлён");
    });

    it("должен вернуть 400 при некорректном ID", async () => {
        const res = await request(app)
        .delete("/api/menu/product/abc")
        .set("Authorization", `Bearer ${token}`);
    
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: "Некорректный ID" });
    });

  });

  describe("DELETE /api/menu/product/:id", () => {
    it("should delete a product", async () => {
      (Product.destroy as jest.Mock).mockResolvedValue(1);
      const res = await request(app)
        .delete("/api/menu/product/1")
        .set("Authorization", `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Продукт удалён");
    });

    it("должен вернуть 400 при некорректном ID", async () => {
        const res = await request(app)
        .delete("/api/menu/product/abc")
        .set("Authorization", `Bearer ${token}`);
        
    
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: "Некорректный ID" });
    });

  });
});

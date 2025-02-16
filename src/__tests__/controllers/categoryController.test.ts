import request from "supertest";
import { app } from "../../server";
import { Category } from "../../models/Category";
import { Product } from "../../models/Product";

jest.mock("../../middleware/authMiddleware", () => ({
  authenticate: (_req: any, _res: any, next: () => any) => next(), // Просто пропускаем дальше
  authorize: () => (_req: any, _res: any, next: () => any) => next(),
}));

jest.mock("../../models/Category");
jest.mock("../../models/Product");

describe("Category Controller", () => {
  let mockCategory: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCategory = {
      id: 1,
      name: "Test Category"
    };
  });

  describe("GET /api/menu/categories", () => {
    it("должен вернуть список категорий", async () => {
      (Category.findAll as jest.Mock).mockResolvedValue([{ ...mockCategory }]);

      const res = await request(app).get("/api/menu/categories");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.arrayContaining([expect.objectContaining(mockCategory)]));
      expect(Category.findAll).toHaveBeenCalled();
    });

    it("должен вернуть 500 при ошибке сервера", async () => {
      (Category.findAll as jest.Mock).mockRejectedValue(new Error());

      const res = await request(app).get("/api/menu/categories");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Ошибка сервера" });
    });
  });

  describe("GET /api/menu/categories/:id", () => {
    it("должен вернуть категорию по ID", async () => {
      (Category.findByPk as jest.Mock).mockResolvedValue({ ...mockCategory });

      const res = await request(app).get("/api/menu/categories/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining(mockCategory));
    });

    it("должен вернуть 400 при некорректном ID", async () => {
      const res = await request(app).get("/api/menu/categories/abc");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Некорректный ID" });
    });

    it("должен вернуть 404, если категория не найдена", async () => {
      (Category.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/api/menu/categories/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Категория не найдена" });
    });
  });

  describe("POST /api/menu/categories", () => {
    it("должен создать новую категорию", async () => {
      (Category.findOne as jest.Mock).mockResolvedValue(null);
      (Category.create as jest.Mock).mockResolvedValue(mockCategory);

      const res = await request(app)
        .post("/api/menu/categories")
        .send({ name: "New Category" });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockCategory);
    });

    it("должен вернуть 400 при невалидных данных", async () => {
      const res = await request(app).post("/api/menu/categories").send({ name: "" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("должен вернуть 409, если категория уже существует", async () => {
      (Category.findOne as jest.Mock).mockResolvedValue(mockCategory);

      const res = await request(app)
        .post("/api/menu/categories")
        .send({ name: "Test Category" });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        error: "Категория с таким названием уже существует",
      });
    });
  });


  describe("PUT /api/menu/categories/:id", () => {
    it("должен обновить категорию", async () => {
      (Category.findByPk as jest.Mock).mockResolvedValue({ update: jest.fn() });
      const res = await request(app)
        .put("/api/menu/categories/1")
        .send({ name: "Updated Category" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Категория обновлена");
    });

    it("должен вернуть 404, если категория не найдена", async () => {
      (Category.findByPk as jest.Mock).mockResolvedValue(null);
      const res = await request(app).put("/api/menu/categories/1").send({ name: "Updated" });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/menu/categories/:id", () => {
    it("должен удалить категорию", async () => {
      (Category.findByPk as jest.Mock).mockResolvedValue({ destroy: jest.fn() });
      (Product.destroy as jest.Mock).mockResolvedValue(1);
      
      const res = await request(app).delete("/api/menu/categories/1");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Категория и все связанные товары удалены");
    });

    it("должен вернуть 400 при некорректном ID", async () => {
      const res = await request(app).delete("/api/menu/categories/abc");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Некорректный ID" });
    });

    it("должен вернуть 404, если категория не найдена", async () => {
      (Category.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete("/api/menu/categories/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Категория не найдена" });
    });
  });
});

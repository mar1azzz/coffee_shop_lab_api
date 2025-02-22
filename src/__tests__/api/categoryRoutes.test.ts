import request from "supertest";
import { app } from "../../server";
import { sequelize } from "../../config/db";
import { Category } from "../../models/Category";
import { User } from "../../models/User";
import bcrypt from "bcrypt";

describe("Category API Integration Tests", () => {

  let validToken: any;
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Пересоздание таблиц перед тестами
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    await User.create({ username: "testadmin", password: hashedPassword, role: "ADMIN" });

    const adminloginRes = await request(app).post("/api/auth/login").send({
          username: "testadmin",
          password: "testpassword",
    });

    validToken = adminloginRes.body.token;
    
  });

  afterEach(async () => {
    await Category.destroy({ where: {} });
  });

  describe("GET /api/menu/categories", () => {
    it("должен вернуть пустой массив при отсутствии категорий", async () => {
      const res = await request(app).get("/api/menu/categories");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("должен вернуть список категорий", async () => {
      await Category.create({ name: "Test Category" });

      const res = await request(app).get("/api/menu/categories");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("Test Category");
    });
  });

  describe("POST /api/menu/categories", () => {
    it("должен создать новую категорию", async () => {
      const res = await request(app)
        .post("/api/menu/categories")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ name: "New Category" });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("New Category");

      const category = await Category.findOne({ where: { name: "New Category" } });
      expect(category).not.toBeNull();
    });

    it("должен вернуть 400, если имя категории пустое", async () => {
      const res = await request(app)
        .post("/api/menu/categories")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ name: "" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("должен вернуть 409, если категория уже существует", async () => {
      await Category.create({ name: "Duplicate Category" });

      const res = await request(app)
        .post("/api/menu/categories")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ name: "Duplicate Category" });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Категория с таким названием уже существует");
    });
  });

  describe("GET /api/menu/categories/:id", () => {
    it("должен вернуть категорию по ID", async () => {
      const category = await Category.create({ name: "Single Category" });

      const res = await request(app).get(`/api/menu/categories/${category.id}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Single Category");
    });

    it("должен вернуть 404, если категории нет", async () => {
      const res = await request(app).get("/api/menu/categories/999");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Категория не найдена");
    });
  });

  describe("PUT /api/menu/categories/:id", () => {
    it("должен обновить категорию", async () => {
      const category = await Category.create({ name: "Old Name" });

      const res = await request(app)
        .put(`/api/menu/categories/${category.id}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ name: "Updated Name" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Категория обновлена");

      const updatedCategory = await Category.findByPk(category.id);
      expect(updatedCategory?.name).toBe("Updated Name");
    });

    it("должен вернуть 404, если категории нет", async () => {
      const res = await request(app)
        .put("/api/menu/categories/999")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ name: "New Name" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Категория не найдена");
    });
  });

  describe("DELETE /api/menu/categories/:id", () => {
    it("должен удалить категорию", async () => {
      const category = await Category.create({ name: "To Be Deleted" });

      const res = await request(app)
      .delete(`/api/menu/categories/${category.id}`)
      .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Категория и все связанные товары удалены");

      const deletedCategory = await Category.findByPk(category.id);
      expect(deletedCategory).toBeNull();
    });

    it("должен вернуть 404, если категории нет", async () => {
      const res = await request(app)
      .delete("/api/menu/categories/999")
      .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Категория не найдена");
    });
  });
});

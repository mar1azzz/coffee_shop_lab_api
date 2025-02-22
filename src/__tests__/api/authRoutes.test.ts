import { authenticate, authorize } from "../../middleware/authMiddleware";
import request from "supertest";
import { app } from "../../server";
import { User } from "../../models/User";
import bcrypt from "bcrypt";

describe("Middleware - Интеграционные тесты", () => {
  let token: string;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("StrongPass123", 10);
    await User.create({
      username: "john_doe",
      password: hashedPassword,
      role: "USER",
    });

    const res = await request(app).post("/api/auth/login").send({
      username: "john_doe",
      password: "StrongPass123",
    });

    token = res.body.token;
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
  });

  it("должен вернуть 401, если токен отсутствует", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Нет доступа");
  });

  it("должен вернуть 403, если токен невалидный", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", "Bearer invalid_token");

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("message", "Неверный токен");
  });

  it("должен позволить выйти, если токен валидный", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Logout successful");
  });
});

describe("Register Controller - Интеграционные тесты", () => {
    afterAll(async () => {
      await User.destroy({ where: {} });
    });
  
    it("должен успешно регистрировать нового пользователя", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "new_user",
        email: "new_user@example.com",
        password: "StrongPass123",
        role: "USER",
      });
  
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "User created successfully");
    });
  
    it("должен вернуть ошибку 409, если username уже существует", async () => {
      await User.create({
        username: "existing_user",
        email: "existing_user@example.com",
        password: "password",
        role: "USER",
      });
  
      const res = await request(app).post("/api/auth/register").send({
        username: "existing_user",
        email: "new_email@example.com",
        password: "StrongPass123",
        role: "USER",
      });
  
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("error", "User with this username already exists");
    });
  
    it("должен вернуть ошибку 400 при некорректном email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "user_without_email",
        email: "invalid-email",
        password: "StrongPass123",
        role: "USER",
      });
  
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  
    it("должен вернуть ошибку 400 при коротком пароле", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "user_with_short_pass",
        email: "valid_email@example.com",
        password: "short",
        role: "USER",
      });
  
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  
    it("должен вернуть ошибку 400 при отсутствии обязательных полей", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "user_without_email",
      });
  
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

});

describe("Login Controller - Интеграционные тесты", () => {
    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash("StrongPass123", 10);
      await User.create({
        username: "john_doe",
        password: hashedPassword,
        role: "USER",
      });
    });
  
    afterAll(async () => {
      await User.destroy({ where: {} }); // Очистка базы данных после тестов
    });
  
    it("должен успешно логиниться с правильными данными", async () => {

      await request(app).post("/api/auth/register").send({
        username: "john_doe",
        email: "new_user@example.com",
        password: "StrongPass123",
        role: "USER",
      });

      const res = await request(app).post("/api/auth/login").send({
        username: "john_doe",
        password: "StrongPass123",
      });
  
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("role", "USER");
    });
  
    it("должен вернуть ошибку при неверном пароле", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "john_doe",
        password: "WrongPass",
      });
  
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid username or password");
    });
  
    it("должен вернуть ошибку при несуществующем пользователе", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "not_exist",
        password: "SomePass",
      });
  
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid username or password");
    });
});

describe("Logout Controller - Интеграционные тесты", () => {
  let token: string;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("StrongPass123", 10);
    await User.create({
      username: "john_doe",
      password: hashedPassword,
      role: "USER",
    });

    const res = await request(app).post("/api/auth/login").send({
      username: "john_doe",
      password: "StrongPass123",
    });

    token = res.body.token;
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
  });

  it("должен успешно выходить из системы с авторизацией", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Logout successful");
  });

  it("должен вернуть ошибку 401 при отсутствии токена", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Нет доступа");
  });
});

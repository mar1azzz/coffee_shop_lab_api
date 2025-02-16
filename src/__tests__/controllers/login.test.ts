import request from "supertest";
import {app} from "../../server"; // Используем экспортированный app
import { User } from "../../models/User";
import bcrypt from "bcrypt";

describe("Login Controller", () => {
  beforeEach(async () => {
    await User.destroy({ where: {} }); // Очищаем пользователей перед тестами

    const hashedPassword = await bcrypt.hash("StrongPass123", 10);
    await User.create({
      username: "john_doe",
      password: hashedPassword,
      role: "USER",
    });
  });

  it("успешный вход с корректными данными", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "john_doe",
      password: "StrongPass123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("role", "USER");
  });

  it("ошибка при неверном пароле", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "john_doe",
      password: "WrongPass",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid username or password" });
  });

  it("ошибка при несуществующем пользователе", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "not_exist",
      password: "SomePass",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid username or password" });
  });
});
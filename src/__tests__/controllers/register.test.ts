import request from "supertest";
import {app} from "../../server";
import { User } from "../../models/User";
import { sequelize } from "../../config/db";

describe("Register Controller", () => {
  beforeEach(async () => {
    await User.destroy({ where: {} }); // Очищаем таблицу пользователей перед тестами
  });

  it("успешная регистрация нового пользователя", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "john_doe",
      email: "john@example.com",
      password: "StrongPass123",
      role: "USER",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "User created successfully");
  });

  it("ошибка при регистрации с уже существующим username", async () => {
    await User.create({
      username: "john_doe",
      email: "john@example.com",
      password: "hashed_password",
      role: "USER",
    });

    const res = await request(app).post("/api/auth/register").send({
      username: "john_doe",
      email: "another_user@example.com",
      password: "AnotherPass123",
      role: "USER",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error", "User with this username already exists");
  });

  it("ошибка при регистрации с некорректным email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "john_doe",
      email: "invalid-email",
      password: "StrongPass123",
      role: "USER",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("ошибка при регистрации с коротким паролем", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "john_doe",
      email: "john@example.com",
      password: "short",
      role: "USER",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("ошибка при отсутствии обязательных полей", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "john_doe",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

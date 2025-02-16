import request from "supertest";
import {app} from "../../server";
import { User } from "../../models/User";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

describe("Logout Controller", () => {
  let token: string;

  beforeAll(async () => {
    // Создаем тестового пользователя
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    await User.create({
      username: "testuser",
      password: hashedPassword,
      role: "USER",
    });

    // Логинимся, чтобы получить токен
    const loginRes = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "testpassword",
    });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    // Очищаем базу после тестов
    await User.destroy({ where: { username: "testuser" } });
  });

  it("should logout successfully when authorized", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Logout successful" });
  });

  it("should return 401 if user is not authenticated", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Нет доступа" });
  });
});

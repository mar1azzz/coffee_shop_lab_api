import request from "supertest";
import { app } from "../../server";
import { Order } from "../../models/Order";
import { OrderItem } from "../../models/OrderItem";
import { Product } from "../../models/Product";
import { User } from "../../models/User";
import bcrypt from "bcrypt";
import { Category } from "../../models/Category";

jest.mock("../../models/Order");
jest.mock("../../models/OrderItem");
jest.mock("../../models/Product");

describe("Order Controller", () => {
  let userToken: any;
  let adminToken: any;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    
    await User.create({ username: "testadmin", password: hashedPassword, role: "ADMIN" });
    await User.create({ username: "testuser", password: hashedPassword, role: "USER" });

    const adminloginRes = await request(app).post("/api/auth/login").send({
      username: "testadmin",
      password: "testpassword",
    });
    
    const userloginRes = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "testpassword",
    });
    
    adminToken = adminloginRes.body.token;
    userToken = userloginRes.body.token;
  });

  describe("POST /api/orders", () => {
    it("should create an order for an authenticated user", async () => {
      const mockOrder = { id: 1, userId: 1, save: jest.fn() };
      const mockProduct = { id: 1, name: "Test Product" };
      const mockOrderItem = { id: 1, orderId: 1, productId: 1, quantity: 2 };

      (Order.create as jest.Mock).mockResolvedValue(mockOrder);
      (Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);
      (OrderItem.create as jest.Mock).mockResolvedValue(mockOrderItem);

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ items: [{ productId: 1, quantity: 2 }] });

      expect(response.status).toBe(201);
      expect(response.body.order).toHaveProperty("id");
    });

    it("Should return 401 if user is not authenticated", async () => {
        const res = await request(app)
          .post("/api/orders")
          .send({ items: [{ productId: 1, quantity: 2 }] });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Нет доступа");
    });

    it("Should return 403 if admin tries to create an order", async () => {
        const res = await request(app)
          .post("/api/orders")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ items: [{ productId: 1, quantity: 2 }] });
        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Администраторы не могут создавать заказы");
    });

    it("Should return 400 for invalid order data", async () => {
        const res = await request(app)
          .post("/api/orders")
          .set("Authorization", `Bearer ${userToken}`)
          .send({ items: [{ productId: "invalid", quantity: -1 }] });
        expect(res.status).toBe(400);
    });

    it("should return 400 if items array is missing", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({});
      expect(res.status).toBe(400);
    });

  });

  describe("GET /orders", () => {
    it("should return orders for an authenticated user", async () => {
      const mockOrders = [{ id: 1, userId: 1, items: [] }];
      (Order.findAll as jest.Mock).mockResolvedValue(mockOrders);

      const response = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrders);
    });

    it("should return 401 if user is not authenticated", async () => {
      const res = await request(app).get("/api/orders");
      expect(res.status).toBe(401);
    });

  });

  describe("PUT /orders/:orderId", () => {
    it("should update an order status if the user is an admin", async () => {
      const mockOrder = { id: 1, status: "pending", save: jest.fn() };
      (Order.findByPk as jest.Mock).mockResolvedValue(mockOrder);

      const response = await request(app)
        .put("/api/orders/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "shipped" });

      expect(response.status).toBe(200);
      expect(mockOrder.status).toBe("shipped");
    });

    it("Should return 403 if a user tries to update an order", async () => {
        const res = await request(app)
          .put("/api/orders/1")
          .set("Authorization", `Bearer ${userToken}`)
          .send({ status: "Shipped" });
        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Нет доступа для редактирования");
    });

    it("should return 400 if order ID is invalid", async () => {
      const res = await request(app)
        .put("/api/orders/invalid")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "shipped" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Некорректный ID заказа");
    });

    it("should return 404 if order does not exist", async () => {
      (Order.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put("/api/orders/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "shipped" });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Заказ не найден");
    });

  });

  describe("DELETE /orders/:orderId", () => {
    it("should delete an order if the user is an admin", async () => {
      const mockOrder = { id: 1, destroy: jest.fn() };
      (Order.findByPk as jest.Mock).mockResolvedValue(mockOrder);

      const response = await request(app)
        .delete("/api/orders/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(mockOrder.destroy).toHaveBeenCalled();
    });

    it("Should return 403 if a user tries to delete an order", async () => {
        const res = await request(app)
          .delete("/api/orders/1")
          .set("Authorization", `Bearer ${userToken}`);
        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Нет доступа для удаления");
    });

    it("should return 404 if order does not exist", async () => {
      (Order.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/orders/999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Заказ не найден");
    });

  });
});

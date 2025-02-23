import request from "supertest";
import { app } from "../../server";
import { Product } from "../../models/Product";
import { User } from "../../models/User";
import bcrypt from "bcrypt";
import { Category } from "../../models/Category";

const CreateProduct = async () => {
  await Category.create({ name: "Test Category" });

  const product = await Product.create({ 
    name: "Капучино",
    price: 5.99,
    categoryId: 1,
    description: "Кофе с молоком",
    img: "https://example.com/image.jpg",
  });

  return product.dataValues;
};

const CreateUser = async (role: string) => {
  const hashedPassword = await bcrypt.hash("testpassword", 10);
  
  await User.create({ username: "user"+role, password: hashedPassword, role: role });

  const userLogin = await request(app).post("/api/auth/login").send({
    username: "user"+role,
    password: "testpassword",
  });

  return userLogin.body;
}

const CreateOrder = async () => {
  const userData = await CreateUser("USER");
  const productData = await CreateProduct();
  const requestBody = {
    items: [
      {
        productId: productData.id,
        quantity: 1
      }
    ]
  };

  const result = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userData.token}`)
      .send(requestBody);

  return result
}

describe("Order Routes Integration Tests", () => {
  it("should allow users to create orders", async () => {
    const response = await CreateOrder();

    expect(response.status).toBe(201);
    expect(response.body.order).toHaveProperty("id");
  });

  it("should return 500 if a product does not exist", async () => {
    const userData = await CreateUser("USER");
    const res = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${userData.token}`)
    .send({ items: [{ productId: 999, quantity: 1 }] });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Продукт с id 999 не найден");
});

  it("should allow admins to update order status", async () => {
    const orderresult = await CreateOrder();
    const adminData = await CreateUser("ADMIN");
    
    const response = await request(app)
      .put(`/api/orders/${orderresult.body.order.id}`)
      .set("Authorization", `Bearer ${adminData.token}`)
      .send({ status: "shipped" });
    
    expect(response.status).toBe(200);
  });

  it("should allow admins to delete orders", async () => {
    const orderresult = await CreateOrder();
    const adminData = await CreateUser("ADMIN");

    const response = await request(app)
      .delete(`/api/orders/${orderresult.body.order.id}`)
      .set("Authorization", `Bearer ${adminData.token}`);
    
    expect(response.status).toBe(200);
  });
});


import { sequelize } from "./db";
import { User, UserRole } from "../models/User";
import { Product } from "../models/Product";

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });

    await User.bulkCreate([
      { email: "admin@coffee.com", password: "admin123", role: UserRole.ADMIN },
      { email: "user@coffee.com", password: "user123", role: UserRole.USER },
    ]);

    await Product.bulkCreate([
      { name: "Капучино", price: 150 },
      { name: "Эспрессо", price: 100 },
      { name: "Латте", price: 170 },
    ]);

    console.log("✅ База данных заполнена тестовыми данными!");
  } catch (error) {
    console.error("❌ Ошибка при заполнении БД:", error);
  }
};

seedDatabase();

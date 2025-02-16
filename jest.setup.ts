import dotenv from "dotenv";
import { sequelize} from "../coffee-shop-api/src/config/db";

beforeEach(async () => {
  await sequelize.sync({ force: true }); // Удаляет все таблицы и создает заново
});

afterAll(async () => {
  await sequelize.close(); // Закрываем соединение после тестов
});

dotenv.config({ path: ".env.test" });

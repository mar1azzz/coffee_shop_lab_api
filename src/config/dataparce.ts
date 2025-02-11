import { sequelize } from "./db";
import { User, UserRole } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });

    const categories = await Category.bulkCreate([
      { name: "Кофе" },
      { name: "Чай" },
      { name: "Десерты"},
      { name: "Завтраки"},
      { name: "Ланчи"}
    ]);

    await User.bulkCreate([
      { username: "admin", email: "admin@coffee.com", password: "admin123", role: UserRole.ADMIN },
      { username: "user", email: "user@coffee.com", password: "user123", role: UserRole.USER },
    ]);

    await Product.bulkCreate([
      { name: "Капучино", price: 150, categoryId: categories[0].id, description: "Кофе с молоком", img: "capuccino.jpg" },
      { name: "Эспрессо", price: 100, categoryId: categories[0].id, description: "Крепкий кофе", img: "espresso.jpg" },
      { name: "Бейквеллский тарт", price: 7.22, categoryId: categories[2].id, description: "Традиционный британский десерт с хрустящим тестом и миндальной начинкой.", img: "https://www.themealdb.com/images/media/meals/wyrqqq1468233628.jpg" },
      { name: "Пудинг из хлеба и масла", price: 10.18, categoryId: categories[2].id, description: "Классический английский десерт из хлеба, заварного крема и изюма.", img: "https://www.themealdb.com/images/media/meals/xqwwpy1483908697.jpg" },
      { name: "Говядина Веллингтон", price: 12.86, categoryId: categories[4].id, description: "Нежная говядина, запечённая в слоёном тесте с грибным паштетом.", img: "https://www.themealdb.com/images/media/meals/vvpprx1487325699.jpg" },
      { name: "Байган Бхарта", price: 14.95, categoryId: categories[4].id, description: "Индийское блюдо из печёных баклажанов с пряными специями.", img: "https://www.themealdb.com/images/media/meals/urtpqw1487341253.jpg" },
      { name: "Грудинка из говядины, тушёная в соусе", price: 7.6, categoryId: categories[4].id, description: "Ароматное тушёное мясо с нежной текстурой и насыщенным вкусом.", img: "https://www.themealdb.com/images/media/meals/ursuup1487348423.jpg" },
      { name: "Жаркое по-воскресному", price: 12.19, categoryId: categories[4].id, description: "Традиционное британское блюдо из запечённой говядины с гарниром.", img: "https://www.themealdb.com/images/media/meals/ssrrrs1503664277.jpg" },
      { name: "Тушёная говядина с чили", price: 8.11, categoryId: categories[4].id, description: "Пряное и насыщенное блюдо из говядины с фасолью и томатами.", img: "https://www.themealdb.com/images/media/meals/uuqvwu1504629254.jpg" },
      { name: "Банановые панкейки", price: 6.28, categoryId: categories[2].id, description: "Нежные блинчики с бананом, идеально сочетающиеся с сиропом.", img: "https://www.themealdb.com/images/media/meals/sywswr1511383814.jpg" },
      { name: "Бефстроганов", price: 13.26, categoryId: categories[4].id, description: "Классическое русское блюдо из говядины в сливочном соусе.", img: "https://www.themealdb.com/images/media/meals/svprys1511176755.jpg" },
      { name: "Брокколи со стилтоном", price: 5.31, categoryId: categories[4].id, description: "Крем-суп из брокколи с голубым сыром – нежный и ароматный.", img: "https://www.themealdb.com/images/media/meals/tvvxpv1511191952.jpg" },
      { name: "Говяжий гуляш", price: 6.73, categoryId: categories[4].id, description: "Традиционное венгерское блюдо с сочной говядиной и овощами.", img: "https://www.themealdb.com/images/media/meals/uyqrrv1511553350.jpg" },
      { name: "Баттенбергский торт", price: 10.5, categoryId: categories[2].id, description: "Красочный бисквитный торт с миндальным вкусом и абрикосовой прослойкой.", img: "https://www.themealdb.com/images/media/meals/ywwrsp1511720277.jpg" },
      { name: "Завтрак с бри и прошутто", price: 5.03, categoryId: categories[3].id, description: "Роскошный завтрак из мягкого сыра, завернутого в хрустящий хлеб.", img: "https://www.themealdb.com/images/media/meals/qqpwsy1511796276.jpg" },
      { name: "Картофель по-буланжерски", price: 5.21, categoryId: categories[3].id, description: "Французский запечённый картофель в ароматном бульоне.", img: "https://www.themealdb.com/images/media/meals/qywups1511796761.jpg" },
      { name: "Бифштекс по-филиппински", price: 12.57, categoryId: categories[4].id, description: "Говядина, замаринованная в соевом соусе и луке, обжаренная до золотистости.", img: "https://www.themealdb.com/images/media/meals/4pqimk1683207418.jpg" },
      { name: "Бигос (Охотничье рагу)", price: 14.66, categoryId: categories[4].id, description: "Польское рагу с квашеной капустой, мясом и специями.", img: "https://www.themealdb.com/images/media/meals/md8w601593348504.jpg" },
      { name: "Омлет с хлебом", price: 10.75, categoryId: categories[3].id, description: "Питательный завтрак из яиц и хрустящего хлеба.", img: "https://www.themealdb.com/images/media/meals/hqaejl1695738653.jpg" },
      { name: "Борщ с свёклой", price: 5.04, categoryId: categories[4].id, description: "Традиционный славянский суп из свёклы с насыщенным вкусом.", img: "https://www.themealdb.com/images/media/meals/zadvgb1699012544.jpg" },
      { name: "Блины", price: 13.18, categoryId: categories[3].id, description: "Тонкие золотистые блины, подающиеся со сметаной или мёдом.", img: "https://www.themealdb.com/images/media/meals/0206h11699013358.jpg" }
    ]);

    console.log("✅ База данных заполнена тестовыми данными!");
  } catch (error) {
    console.error("❌ Ошибка при заполнении БД:", error);
  }
};

seedDatabase();

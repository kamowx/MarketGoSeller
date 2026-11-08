import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SellerBottomnav from "../components/SellerBottomnav";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const BUSINESS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/buisness";
const PRODUCTS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/products";

function AddNewProducts() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [saving, setSaving] = useState(false);

  // Выбрать размер
  const toggleSize = (size) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((item) => item !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  // Выбрать цвет
  const toggleColor = (color) => {
    if (colors.includes(color.name)) {
      setColors(colors.filter((item) => item !== color.name));
    } else {
      setColors([...colors, color.name]);
    }
  };

  // Сохранить товар
  const saveProduct = async () => {
    const uid = localStorage.getItem("uid");

    if (!uid) {
      navigate("/sellersignin");
      return;
    }

    if (
      !name.trim() ||
      !description.trim() ||
      !category ||
      !price ||
      !image.trim()
    ) {
      alert("Заполните все основные поля товара");
      return;
    }

    if (Number(price) <= 0) {
      alert("Введите правильную цену");
      return;
    }

    if (sizes.length === 0) {
      alert("Выберите хотя бы один размер");
      return;
    }

    if (colors.length === 0) {
      alert("Выберите хотя бы один цвет");
      return;
    }

    try {
      setSaving(true);

      //  пользователей
      const usersResponse = await axios.get(USERS_URL);

      const currentUser = usersResponse.data.find(
        (item) => String(item.uid) === String(uid),
      );

      if (!currentUser || currentUser.role !== "seller") {
        alert("Продавец не найден");
        navigate("/sellersignin");
        return;
      }

      //  магазины
      const businessResponse = await axios.get(BUSINESS_URL);

      //  userId
      const currentBusiness = businessResponse.data.find(
        (item) => String(item.userId) === String(currentUser.id),
      );

      if (!currentBusiness) {
        alert("Магазин не найден");
        return;
      }

      //  новый товар
      const newProduct = {
        userId: currentUser.id,
        createdAt: new Date().toISOString(),

        avatar: image,
        name: name.trim(),
        description: description.trim(),
        category: category,
        price: Number(price),

        adrescompany: currentBusiness.adrescompany,
        namecompany: currentBusiness.name,

        size: sizes,
        color: colors,
      };

      const response = await axios.post(PRODUCTS_URL, newProduct);

      if (response.status === 201) {
        alert("Товар успешно добавлен!");
        navigate("/sellerproducts");
      }
    } catch (error) {
      console.error("ОШИБКА СОХРАНЕНИЯ ТОВАРА:", error);
      alert("Не удалось сохранить товар");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="seller-add-product-page">
      <SellerBottomnav />

      <main className="seller-add-product-container">
        <div className="seller-add-product-header">
          <div>
            <span>УПРАВЛЕНИЕ МАГАЗИНОМ</span>
            <h1>Добавить товар</h1>
            <p>Заполните информацию о новом товаре</p>
          </div>

          <button
            className="seller-add-back"
            onClick={() => navigate("/seller/products")}
          >
            <i className="fa-solid fa-arrow-left"></i>
            Назад
          </button>
        </div>

        <div className="seller-add-product-form">
          {/* Фотография товара */}
          <div className="seller-add-section">
            <div className="seller-add-section-title">
              <span>01</span>
              <div>
                <h2>Фотография товара</h2>
                <p>Добавьте одну фотографию по URL</p>
              </div>
            </div>

            <div className="seller-add-images">
              <div className="seller-add-image-field">
                <div className="seller-add-image-preview">
                  {image ? (
                    <img src={image} alt="Предпросмотр товара" />
                  ) : (
                    <i className="fa-solid fa-image"></i>
                  )}
                </div>

                <label>Фотография товара</label>

                <input
                  type="url"
                  placeholder="Вставьте URL изображения"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Основная информация */}
          <div className="seller-add-section">
            <div className="seller-add-section-title">
              <span>02</span>
              <div>
                <h2>Основная информация</h2>
                <p>Название и описание товара</p>
              </div>
            </div>

            <div className="seller-add-field">
              <label>Название товара</label>
              <input
                type="text"
                placeholder="Например, Мужская футболка"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="seller-add-field">
              <label>Подробное описание</label>
              <textarea
                rows="5"
                placeholder="Опишите материал, особенности и характеристики товара..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="seller-add-field">
              <label>Категория товара</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Выберите категорию</option>
                <option value="Мужская одежда">Мужская одежда</option>
                <option value="Женская одежда">Женская одежда</option>
                <option value="Детская одежда">Детская одежда</option>
                <option value="Обувь">Обувь</option>
                <option value="Аксессуары">Аксессуары</option>
                <option value="Спортивная одежда">Спортивная одежда</option>
              </select>
            </div>
          </div>

          {/* Размеры */}
          <div className="seller-add-section">
            <div className="seller-add-section-title">
              <span>03</span>
              <div>
                <h2>Размеры товара</h2>
                <p>Выберите доступные размеры</p>
              </div>
            </div>

            <div className="seller-add-options">
              {[
                "XS",
                "S",
                "M",
                "L",
                "XL",
                "XXL",
                "XXXL",
                "35",
                "36",
                "37",
                "38",
                "39",
                "40",
                "41",
                "42",
                "43",
                "44",
                "45",
              ].map((size) => (
                <button
                  type="button"
                  key={size}
                  className={
                    sizes.includes(size)
                      ? "seller-add-option selected"
                      : "seller-add-option"
                  }
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Цвета */}
          <div className="seller-add-section">
            <div className="seller-add-section-title">
              <span>04</span>
              <div>
                <h2>Цвета товара</h2>
                <p>Выберите все доступные цвета</p>
              </div>
            </div>

            <div className="seller-add-colors">
              {[
                { name: "Чёрный", code: "#171717" },
                { name: "Белый", code: "#ffffff" },
                { name: "Серый", code: "#888888" },
                { name: "Красный", code: "#e53935" },
                { name: "Синий", code: "#1565c0" },
                { name: "Голубой", code: "#64b5f6" },
                { name: "Зелёный", code: "#2e7d32" },
                { name: "Жёлтый", code: "#fdd835" },
                { name: "Оранжевый", code: "#ef6c00" },
                { name: "Розовый", code: "#ec407a" },
                { name: "Фиолетовый", code: "#7b1fa2" },
                { name: "Коричневый", code: "#795548" },
                { name: "Бежевый", code: "#d7c3a5" },
                { name: "Бордовый", code: "#800020" },
                { name: "Хаки", code: "#78866b" },
                { name: "Мятный", code: "#98ff98" },
              ].map((color) => (
                <button
                  type="button"
                  key={color.name}
                  className={
                    colors.includes(color.name)
                      ? "seller-add-color selected"
                      : "seller-add-color"
                  }
                  onClick={() => toggleColor(color)}
                >
                  <span
                    className="seller-add-color-circle"
                    style={{ background: color.code }}
                  ></span>
                  {color.name}
                  {colors.includes(color.name) && (
                    <i className="fa-solid fa-check"></i>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Цена */}
          <div className="seller-add-section">
            <div className="seller-add-section-title">
              <span>05</span>
              <div>
                <h2>Стоимость товара</h2>
                <p>Укажите цену в сомах</p>
              </div>
            </div>

            <div className="seller-add-field">
              <label>Цена товара</label>
              <div className="seller-add-price">
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <span>сом</span>
              </div>
            </div>
          </div>

          {/* Сохранение */}
          <div className="seller-add-submit">
            <button type="button" onClick={saveProduct} disabled={saving}>
              <i className="fa-solid fa-check"></i>
              {saving ? "Сохранение..." : "Сохранить товар"}
            </button>

            <p>Проверьте информацию перед сохранением товара</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddNewProducts;

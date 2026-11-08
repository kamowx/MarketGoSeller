import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SellerBottomnav from "../components/SellerBottomnav";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const PRODUCTS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/products";

function Sellerproducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [loading, setLoading] = useState(true);

  const getProducts = async () => {
    try {
      const uid = localStorage.getItem("uid");

      if (!uid) {
        navigate("/sellersignin");
        return;
      }

      const usersResponse = await axios.get(USERS_URL);

      const currentUser = usersResponse.data.find(
        (item) => String(item.uid) === String(uid),
      );

      if (!currentUser || currentUser.role !== "seller") {
        navigate("/sellersignin");
        return;
      }

      const productsResponse = await axios.get(PRODUCTS_URL);

      const sellerProducts = productsResponse.data.filter(
        (item) => String(item.userId) === String(currentUser.id),
      );

      setProducts(sellerProducts);
    } catch (error) {
      console.log("Ошибка получения товаров:", error);
      alert("Не удалось загрузить товары");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const openEdit = (product) => {
    setSelectedProduct(product);
    setEditName(product.name);
    setEditPrice(product.price);
  };

  const saveEdit = async () => {
    if (!editName.trim() || !editPrice || Number(editPrice) <= 0) {
      alert("Заполните название и правильную цену");
      return;
    }

    try {
      const response = await axios.put(
        `${PRODUCTS_URL}/${selectedProduct.id}`,
        {
          ...selectedProduct,
          name: editName.trim(),
          price: Number(editPrice),
        },
      );

      setProducts(
        products.map((product) =>
          product.id === selectedProduct.id ? response.data : product,
        ),
      );

      setSelectedProduct(null);
      alert("Товар успешно обновлён");
    } catch (error) {
      console.log("Ошибка изменения товара:", error);
      alert("Не удалось изменить товар");
    }
  };

  // Удаляем товар
  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Вы действительно хотите удалить этот товар?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${PRODUCTS_URL}/${id}`);

      setProducts(products.filter((product) => product.id !== id));

      alert("Товар удалён");
    } catch (error) {
      console.log("Ошибка удаления товара:", error);
      alert("Не удалось удалить товар");
    }
  };

  return (
    <div className="seller-page">
      <SellerBottomnav />

      <main className="seller-main">
        <div className="seller-header">
          <div>
            <span className="seller-header-small">КАБИНЕТ ПРОДАВЦА</span>
            <h1>Мои товары</h1>
            <p>Управляйте товарами своего магазина</p>
          </div>

          <Link to="/addnewproducts" className="seller-add-button">
            <i className="fa-solid fa-plus"></i>
            Добавить товар
          </Link>
        </div>

        <div className="seller-statistics">
          <div className="seller-stat-card">
            <div className="seller-stat-icon">
              <i className="fa-solid fa-box"></i>
            </div>
            <div>
              <span>Всего товаров</span>
              <h3>{products.length}</h3>
            </div>
          </div>

          <div className="seller-stat-card">
            <div className="seller-stat-icon">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div>
              <span>Активные товары</span>
              <h3>{products.length}</h3>
            </div>
          </div>

          <div className="seller-stat-card">
            <div className="seller-stat-icon">
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
            <div>
              <span>Новые заказы</span>
              <h3>0</h3>
            </div>
          </div>
        </div>

        <div className="seller-products-heading">
          <div>
            <h2>Все товары</h2>
            <p>Список товаров вашего магазина</p>
          </div>

          <span className="seller-products-count">
            {products.length} товара
          </span>
        </div>

        {loading ? (
          <p>Загрузка товаров...</p>
        ) : (
          <div className="seller-products-grid">
            {products.map((product) => (
              <div className="seller-product-card" key={product.id}>
                <div className="seller-product-image">
                  <img src={product.avatar} alt={product.name} />
                </div>

                <div className="seller-product-info">
                  <span className="seller-product-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <div className="seller-product-bottom">
                    <strong>
                      {Number(product.price).toLocaleString("ru-RU")} сом
                    </strong>

                    <button
                      className="seller-edit-button"
                      onClick={() => openEdit(product)}
                    >
                      <i className="fa-solid fa-pen"></i>
                      Редактировать
                    </button>

                    <button
                      className="seller-delete-button"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                      Удалить товар
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="seller-empty">
            <i className="fa-solid fa-box-open"></i>
            <h3>Пока нет товаров</h3>
            <p>Добавьте первый товар в свой магазин</p>
            <Link to="/addnewproducts" className="seller-add-button">
              <i className="fa-solid fa-plus"></i>
              Добавить товар
            </Link>
          </div>
        )}
      </main>

      {selectedProduct && (
        <div
          className="seller-modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div className="seller-modal" onClick={(e) => e.stopPropagation()}>
            <div className="seller-modal-header">
              <div>
                <span>УПРАВЛЕНИЕ ТОВАРОМ</span>
                <h2>Редактировать товар</h2>
              </div>

              <button
                className="seller-modal-close"
                onClick={() => setSelectedProduct(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="seller-modal-body">
              <label>Название товара</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <label>Цена товара (сом)</label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />

              <button className="seller-modal-save" onClick={saveEdit}>
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sellerproducts;

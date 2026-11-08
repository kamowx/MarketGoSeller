import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SellerBottomnav from "../components/SellerBottomnav";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const PRODUCTS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/products";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Sellerneworders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getOrders = async () => {
    try {
      const uid = localStorage.getItem("uid")?.replaceAll('"', "");

      if (!uid) {
        navigate("/sellersignin");
        return;
      }

      const usersResponse = await axios.get(USERS_URL);

      const currentUser = usersResponse.data.find(
        (item) => String(item.uid).replaceAll('"', "") === String(uid),
      );

      if (!currentUser || currentUser.role !== "seller") {
        navigate("/sellersignin");
        return;
      }

      const productsResponse = await axios.get(PRODUCTS_URL);

      const sellerProducts = productsResponse.data.filter(
        (item) => String(item.userId) === String(currentUser.id),
      );

      const ordersResponse = await axios.get(ORDERS_URL);

      const sellerOrders = ordersResponse.data.filter((order) => {
        const sellerProduct = sellerProducts.find(
          (product) => String(product.id) === String(order.productId),
        );

        return sellerProduct && order.orderstatus === "Ожидание";
      });

      sellerOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setOrders(sellerOrders);
    } catch (error) {
      console.log("Ошибка получения заказов:", error);
      alert("Не удалось загрузить заказы");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const formatPrice = (price) => Number(price || 0).toLocaleString("ru-RU");

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("ru-RU");
  };

  return (
    <div className="seller-orders-page">
      <main className="seller-orders-main">
        <div className="seller-orders-header">
          <div>
            <span className="seller-orders-small">КАБИНЕТ ПРОДАВЦА</span>
            <h2>Новые заказы</h2>
            <p>Заказы, которые ожидают вашего подтверждения</p>
          </div>

          <span className="seller-orders-count">{orders.length} новых</span>
        </div>

        <div className="seller-orders-navigation">
          <Link to="/sellerneworders" className="seller-orders-nav active">
            <i className="fa-solid fa-inbox"></i>
            <span>Новые заказы</span>
            <b>{orders.length}</b>
          </Link>

          <Link to="/sellerconfirmedorders" className="seller-orders-nav">
            <i className="fa-solid fa-circle-check"></i>
            <span>Подтверждённые</span>
          </Link>

          <Link to="/sellercourierorders" className="seller-orders-nav">
            <i className="fa-solid fa-truck"></i>
            <span>Вызванный курьер</span>
          </Link>

          <Link to="/sellercourieraccepted" className="seller-orders-nav">
            <i className="fa-solid fa-box"></i>
            <span>Передать курьеру</span>
          </Link>

          <Link to="/sellercompletedorders" className="seller-orders-nav">
            <i className="fa-solid fa-clock-rotate-left"></i>
            <span>История заказов</span>
          </Link>
        </div>

        <div className="seller-orders-list">
          {loading ? (
            <p>Загрузка заказов...</p>
          ) : orders.length === 0 ? (
            <div className="seller-orders-empty">
              <i className="fa-solid fa-inbox"></i>
              <h3>Пока нет новых заказов</h3>
              <p>Когда покупатели закажут ваши товары, они появятся здесь.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div className="seller-order-card" key={order.id}>
                <div className="seller-order-top">
                  <span>Заказ № {order.id}</span>
                  <span className="seller-order-status">Новый</span>
                </div>

                <div className="seller-order-product">
                  <img src={order.avatar} alt={order.name} />

                  <div>
                    <h4>{order.name}</h4>
                    <p>
                      Размер: {order.size || "—"} · Цвет: {order.color || "—"}
                    </p>
                    <strong>{formatPrice(order.price)} сом</strong>
                  </div>
                </div>

                <div className="seller-order-info">
                  <p>
                    <span>Покупатель</span> {order.firstname} {order.lastname}
                  </p>
                  <p>
                    <span>Телeфонный номер</span> {order.numberphone || "-"}
                  </p>

                  <p>
                    <span>Адрес</span> {order.adres}
                  </p>

                  <p>
                    <span>Количество</span> {order.quantity || 1} шт.
                  </p>

                  <p>
                    <span>Дата заказа</span> {formatDate(order.createdAt)}
                  </p>
                </div>

                <Link
                  to={`/sellerneworderdetails/${order.id}`}
                  className="seller-order-button"
                >
                  Посмотреть заказ
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            ))
          )}
        </div>
      </main>

      <SellerBottomnav />
    </div>
  );
}

export default Sellerneworders;

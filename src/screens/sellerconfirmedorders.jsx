import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SellerBottomnav from "../components/SellerBottomnav";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const PRODUCTS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/products";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Sellerconfirmedorders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [callingId, setCallingId] = useState(null);

  const getOrders = async () => {
    try {
      const uid = localStorage.getItem("uid")?.replaceAll('"', "");

      if (!uid) {
        navigate("/sellersignin");
        return;
      }

      const usersResponse = await axios.get(USERS_URL);

      const currentSeller = usersResponse.data.find(
        (item) => String(item.uid).replaceAll('"', "") === String(uid),
      );

      if (!currentSeller || currentSeller.role !== "seller") {
        navigate("/sellersignin");
        return;
      }

      const productsResponse = await axios.get(PRODUCTS_URL);

      const sellerProducts = productsResponse.data.filter(
        (item) => String(item.userId) === String(currentSeller.id),
      );

      const ordersResponse = await axios.get(ORDERS_URL);

      const sellerOrders = ordersResponse.data.filter((order) => {
        const sellerProduct = sellerProducts.find(
          (product) => String(product.id) === String(order.productId),
        );

        return sellerProduct && order.orderstatus === "Подтверждено";
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

  const callCourier = async (order) => {
    if (callingId) return;

    if (order.orderstatus !== "Подтверждено") {
      alert("Этот заказ уже обработан");
      return;
    }

    try {
      setCallingId(order.id);

      await axios.put(`${ORDERS_URL}/${order.id}`, {
        ...order,
        orderstatus: "Ожидание курьера",
      });

      setOrders((prev) =>
        prev.filter((item) => String(item.id) !== String(order.id)),
      );

      alert("Заказ отправлен на поиск курьера!");
    } catch (error) {
      console.log("Ошибка вызова курьера:", error);
      alert("Не удалось вызвать курьера");
    } finally {
      setCallingId(null);
    }
  };

  return (
    <div className="seller-confirmed-page">
      <div className="seller-confirmed-header">
        <div>
          <h2>Подтверждённые заказы</h2>
          <p>Заказы, которые вы подтвердили и готовите к отправке</p>
        </div>

        <span className="seller-confirmed-count">{orders.length} заказов</span>
      </div>

      <div className="seller-confirmed-list">
        {loading ? (
          <p>Загрузка заказов...</p>
        ) : orders.length === 0 ? (
          <div className="seller-confirmed-empty">
            <i className="fa-solid fa-circle-check"></i>
            <h3>Нет подтверждённых заказов</h3>
            <p>Подтверждённые заказы появятся здесь.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div className="seller-confirmed-card" key={order.id}>
              <div className="seller-confirmed-top">
                <strong>Заказ № MG-{order.id}</strong>
                <span>Подтверждён</span>
              </div>

              <div className="seller-confirmed-product">
                <img src={order.avatar} alt={order.name} />

                <div>
                  <h4>{order.name}</h4>
                  <p>
                    Размер: {order.size || "—"} · Цвет: {order.color || "—"}
                  </p>
                  <strong>{formatPrice(order.price)} сом</strong>
                </div>
              </div>

              <div className="seller-confirmed-info">
                <p>
                  <span>Покупатель</span> {order.firstname} {order.lastname}
                </p>

                <p>
                  <span>Количество</span> {order.quantity || 1} шт.
                </p>

                <p>
                  <span>Адрес</span> {order.adres || "—"}
                </p>

                <p>
                  <span>Номер телефона</span> {order.numberphone || "—"}
                </p>

                <p>
                  <span>Дата заказа</span> {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="seller-confirmed-actions">
                <button
                  className="seller-confirmed-button"
                  onClick={() => callCourier(order)}
                  disabled={callingId === order.id}
                >
                  <i className="fa-solid fa-truck"></i>
                  {callingId === order.id ? "Отправка..." : "Вызвать курьера"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <SellerBottomnav />
    </div>
  );
}

export default Sellerconfirmedorders;

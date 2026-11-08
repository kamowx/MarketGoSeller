import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SellerBottomnav from "../components/SellerBottomnav";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const PRODUCTS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/products";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Sellercompletedorders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompletedOrders();
  }, []);

  const getCompletedOrders = async () => {
    try {
      let uid = localStorage.getItem("uid");

      if (!uid) {
        navigate("/");
        return;
      }

      try {
        uid = JSON.parse(uid);
      } catch (error) {}

      const usersResponse = await axios.get(USERS_URL);

      const currentSeller = usersResponse.data.find(
        (item) => String(item.uid) === String(uid),
      );

      if (!currentSeller || currentSeller.role !== "seller") {
        navigate("/");
        return;
      }

      const [productsResponse, ordersResponse] = await Promise.all([
        axios.get(PRODUCTS_URL),
        axios.get(ORDERS_URL),
      ]);

      const sellerProducts = productsResponse.data.filter(
        (item) => String(item.userId) === String(currentSeller.id),
      );

      const productIds = sellerProducts.map((item) => String(item.id));

      const completedOrders = ordersResponse.data
        .filter(
          (item) =>
            productIds.includes(String(item.productId)) &&
            (item.orderstatus === "Получено" ||
              item.orderstatus === "Завершён"),
        )
        .sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );

      setOrders(completedOrders);
    } catch (error) {
      console.log("Ошибка загрузки завершённых заказов:", error);
      alert("Не удалось загрузить завершённые заказы");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Не указана";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) return "Не указана";

    return parsedDate.toLocaleDateString("ru-RU");
  };

  return (
    <div className="seller-completed-page">
      <div className="seller-completed-header">
        <div>
          <h2>Завершённые заказы</h2>
          <p>История заказов, которые уже доставлены покупателям</p>
        </div>

        <span className="seller-completed-count">{orders.length} заказов</span>
      </div>

      <div className="seller-completed-list">
        {loading ? (
          <p>Загрузка заказов...</p>
        ) : orders.length === 0 ? (
          <p>Завершённых заказов пока нет</p>
        ) : (
          orders.map((order) => (
            <div className="seller-completed-card" key={order.id}>
              <div className="seller-completed-top">
                <strong>Заказ № MG-{order.id}</strong>
                <span>Завершён</span>
              </div>

              <div className="seller-completed-product">
                <img
                  src={
                    order.avatar || "https://placehold.co/300x300?text=Product"
                  }
                  alt={order.name || "Товар"}
                />

                <div>
                  <h4>{order.name || "Без названия"}</h4>

                  <p>
                    Размер: {order.size || "Не указан"} · Цвет:{" "}
                    {order.color || "Не указан"}
                  </p>

                  <strong>
                    {Number(order.price || 0).toLocaleString("ru-RU")} сом
                  </strong>
                </div>
              </div>

              <div className="seller-completed-info">
                <p>
                  <span>Покупатель</span> {order.firstname || ""}{" "}
                  {order.lastname || ""}
                </p>

                <p>
                  <span>Курьер</span>{" "}
                  {order.courierName ||
                    [order.courierFirstname, order.courierLastname]
                      .filter(Boolean)
                      .join(" ") ||
                    "Не указан"}
                </p>

                <p>
                  <span>Дата доставки</span>{" "}
                  {formatDate(
                    order.completedAt ||
                      order.deliveredAt ||
                      order.updatedAt ||
                      order.createdAt,
                  )}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <SellerBottomnav />
    </div>
  );
}

export default Sellercompletedorders;

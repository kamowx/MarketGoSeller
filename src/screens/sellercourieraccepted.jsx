import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SellerBottomnav from "../components/SellerBottomnav";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const PRODUCTS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/products";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Sellercourieraccepted() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async () => {
    try {
      const uid = localStorage.getItem("uid");

      if (!uid) {
        navigate("/sellersignin");
        return;
      }

      const usersResponse = await axios.get(USERS_URL);

      const currentSeller = usersResponse.data.find(
        (item) => item.uid === uid && item.role === "seller",
      );

      if (!currentSeller) {
        navigate("/sellersignin");
        return;
      }

      const productsResponse = await axios.get(PRODUCTS_URL);

      const sellerProducts = productsResponse.data.filter(
        (item) => String(item.userId) === String(currentSeller.id),
      );

      const sellerProductIds = sellerProducts.map((item) => String(item.id));

      const ordersResponse = await axios.get(ORDERS_URL);

      const sellerOrders = ordersResponse.data.filter(
        (item) =>
          sellerProductIds.includes(String(item.productId)) &&
          item.orderstatus === "Получить",
      );

      sellerOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setOrders(sellerOrders);
    } catch (error) {
      console.log("Ошибка загрузки заказов:", error);
    } finally {
      setLoading(false);
    }
  };

  // Передать заказ курьеру
  const giveOrderToCourier = async (order) => {
    try {
      await axios.put(`${ORDERS_URL}/${order.id}`, {
        ...order,
        orderstatus: "Передано",
      });

      setOrders((prev) => prev.filter((item) => item.id !== order.id));

      alert("Заказ передан курьеру!");
    } catch (error) {
      console.log("Ошибка передачи заказа:", error);
      alert("Не удалось передать заказ");
    }
  };

  return (
    <div className="seller-confirmed-page">
      <div className="seller-confirmed-header">
        <div>
          <h2>Ожидание прихода курьера</h2>
          <p>Заказы, которые курьер уже принял и скоро приедет забирать</p>
        </div>

        <div className="seller-confirmed-count">{orders.length} заказов</div>
      </div>

      {loading ? (
        <div className="seller-confirmed-empty">
          <p>Загрузка заказов...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="seller-confirmed-empty">
          <h3>Пока нет заказов</h3>
          <p>
            Здесь появятся заказы, которые курьеры приняли и скоро приедут
            забирать
          </p>
        </div>
      ) : (
        <div className="seller-confirmed-list">
          {orders.map((order) => (
            <div className="seller-confirmed-card" key={order.id}>
              <div className="seller-confirmed-card-top">
                <div>
                  <span className="seller-confirmed-order-number">
                    Заказ №{order.id}
                  </span>

                  <span className="seller-confirmed-status">
                    <i className="fa-solid fa-truck"></i>
                    Курьер приехал за заказом
                  </span>
                </div>

                <span className="seller-confirmed-price">
                  {Number(order.price).toLocaleString("ru-RU")} сом
                </span>
              </div>

              <div className="seller-confirmed-product">
                <img src={order.avatar} alt={order.name} />

                <div>
                  <h3>{order.name}</h3>
                  <p>Размер: {order.size || "Не указан"}</p>
                  <p>Цвет: {order.color || "Не указан"}</p>
                  <p>Количество: {order.quantity || 1} шт.</p>
                </div>
              </div>

              <div className="seller-confirmed-info">
                <p>
                  <i className="fa-solid fa-user"></i>
                  {order.firstname} {order.lastname}
                </p>

                <p>
                  <i className="fa-solid fa-phone"></i>
                  {order.numberphone || "Не указан"}
                </p>

                <p>
                  <i className="fa-solid fa-location-dot"></i>
                  {order.adres || "Адрес не указан"}
                </p>
              </div>

              <div className="seller-confirmed-card-bottom">
                <span>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("ru-RU")
                    : ""}
                </span>

                <button
                  className="seller-give-order-button"
                  onClick={() => giveOrderToCourier(order)}
                >
                  Передать
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SellerBottomnav />
    </div>
  );
}

export default Sellercourieraccepted;

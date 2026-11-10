import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SellerBottomnav from "../components/SellerBottomnav";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const PRODUCTS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/products";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Sellercourierorders() {
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

      const currentSeller = usersResponse.data.find(
        (item) =>
          String(item.uid).replaceAll('"', "") === String(uid) &&
          item.role === "seller",
      );

      if (!currentSeller) {
        navigate("/sellersignin");
        return;
      }

      const productsResponse = await axios.get(PRODUCTS_URL);

      const sellerProducts = productsResponse.data.filter(
        (item) => String(item.userId) === String(currentSeller.id),
      );

      const ordersResponse = await axios.get(ORDERS_URL);

      const sellerOrders = [];

      ordersResponse.data.forEach((order) => {
        // Новая структура storeOrders
        if (Array.isArray(order.storeOrders) && order.storeOrders.length > 0) {
          const storeOrder = order.storeOrders.find(
            (item) => String(item.sellerId) === String(currentSeller.id),
          );

          if (storeOrder && storeOrder.orderstatus === "Ожидание курьера") {
            sellerOrders.push({
              ...order,
              storeOrder,
              sellerProducts: storeOrder.products || [],
              sellerTotal: Number(storeOrder.totalPrice || 0),
              sellerWeight: Number(storeOrder.allweight || 0),
            });
          }

          return;
        }

        // Поддержка старых заказов
        const orderProductIds = Array.isArray(order.productId)
          ? order.productId.map(String)
          : [String(order.productId)];

        const myProducts = sellerProducts.filter((product) =>
          orderProductIds.includes(String(product.id)),
        );

        if (myProducts.length > 0 && order.orderstatus === "Ожидание курьера") {
          const products = (order.products || []).filter((item) =>
            myProducts.some(
              (product) => String(product.id) === String(item.id),
            ),
          );

          sellerOrders.push({
            ...order,
            sellerProducts:
              products.length > 0
                ? products
                : myProducts.map((product) => ({
                    id: product.id,
                    avatar: product.avatar,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                  })),
            sellerTotal: Number(order.totalPrice || order.price || 0),
            sellerWeight: Number(order.allweight || 0),
          });
        }
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
    <div className="seller-confirmed-page">
      <div className="seller-confirmed-header">
        <div>
          <h2>Ожидание курьера</h2>
          <p>Заказы, для которых вы вызвали курьера</p>
        </div>

        <span className="seller-confirmed-count">{orders.length} заказов</span>
      </div>

      <div className="seller-confirmed-list">
        {loading ? (
          <p>Загрузка заказов...</p>
        ) : orders.length === 0 ? (
          <div className="seller-confirmed-empty">
            <i className="fa-solid fa-truck"></i>
            <h3>Пока нет заказов</h3>
            <p>Заказы, ожидающие принятия курьером, появятся здесь.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div className="seller-confirmed-card" key={order.id}>
              <div className="seller-confirmed-top">
                <strong>Заказ № MG-{order.id}</strong>
                <span>Ожидание курьера</span>
              </div>

              {(order.sellerProducts || []).map((product, index) => (
                <div
                  className="seller-confirmed-product"
                  key={product.id || index}
                >
                  <img
                    src={product.avatar || ""}
                    alt={product.name || "Товар"}
                  />

                  <div>
                    <h4>{product.name || "Товар"}</h4>
                    <p>
                      Размер: {product.size || "—"} · Цвет:{" "}
                      {product.color || "—"}
                    </p>
                    <p>Количество: {product.quantity || 1} шт.</p>
                    <strong>
                      {formatPrice(
                        Number(product.price || 0) *
                          Number(product.quantity || 1),
                      )}{" "}
                      сом
                    </strong>
                  </div>
                </div>
              ))}

              <div className="seller-confirmed-info">
                <p>
                  <span>Покупатель</span> {order.firstname || ""}{" "}
                  {order.lastname || ""}
                </p>

                <p>
                  <span>Количество товаров</span>{" "}
                  {(order.sellerProducts || []).reduce(
                    (sum, item) => sum + Number(item.quantity || 1),
                    0,
                  )}{" "}
                  шт.
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

                <p>
                  <span>Итого</span>{" "}
                  <strong>{formatPrice(order.sellerTotal)} сом</strong>
                </p>
              </div>

              <Link
                to={`/sellercourierdetails/${order.id}`}
                className="seller-confirmed-button"
              >
                Подробнее
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          ))
        )}
      </div>

      <SellerBottomnav />
    </div>
  );
}

export default Sellercourierorders;

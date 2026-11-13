import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      let uid = String(localStorage.getItem("uid") || "").replaceAll('"', "");

      if (!uid) {
        navigate("/");
        return;
      }

      const usersResponse = await axios.get(USERS_URL);

      const currentSeller = usersResponse.data.find(
        (item) =>
          String(item.uid).replaceAll('"', "") === uid &&
          item.role === "seller",
      );

      if (!currentSeller) {
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

      const completedOrders = [];

      ordersResponse.data.forEach((order) => {
        if (Array.isArray(order.storeOrders) && order.storeOrders.length > 0) {
          const myStore = order.storeOrders.find(
            (store) =>
              String(store.sellerId) === String(currentSeller.id) &&
              store.orderstatus === "Получено",
          );

          if (myStore) {
            completedOrders.push({
              ...order,
              sellerStore: myStore,
              sellerProducts: Array.isArray(myStore.products)
                ? myStore.products
                : [],
              sellerTotalPrice: Number(myStore.totalPrice || 0),
              sellerWeight: Number(myStore.allweight || 0),
            });
          }

          return;
        }

        const orderProductIds = Array.isArray(order.productId)
          ? order.productId.map(String)
          : [String(order.productId)];

        const myProducts = sellerProducts.filter((product) =>
          orderProductIds.includes(String(product.id)),
        );

        if (
          myProducts.length > 0 &&
          (order.orderstatus === "Получено" ||
            order.orderstatus === "Завершен" ||
            order.orderstatus === "Завершён")
        ) {
          const oldProducts = Array.isArray(order.products)
            ? order.products.filter((item) =>
                myProducts.some(
                  (product) => String(product.id) === String(item.id),
                ),
              )
            : myProducts.map((product) => ({
                ...product,
                quantity: order.quantity || 1,
              }));

          completedOrders.push({
            ...order,
            sellerProducts: oldProducts,
            sellerTotalPrice: Number(order.totalPrice ?? order.price ?? 0),
            sellerWeight: Number(order.allweight || 0),
          });
        }
      });

      completedOrders.sort(
        (a, b) =>
          new Date(b.completedAt || b.deliveredAt || b.createdAt || 0) -
          new Date(a.completedAt || a.deliveredAt || a.createdAt || 0),
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
            <div
              className="seller-completed-card"
              key={`${order.id}-${order.sellerStore?.businessId || "old"}`}
            >
              <div className="seller-completed-top">
                <strong>Заказ № MG-{order.id}</strong>
                <span>Получено</span>
              </div>

              {order.sellerProducts.map((product, index) => (
                <div
                  className="seller-completed-product"
                  key={product.id || index}
                >
                  <img
                    src={
                      product.avatar ||
                      "https://placehold.co/300x300?text=Product"
                    }
                    alt={product.name || "Товар"}
                  />

                  <div>
                    <h4>{product.name || "Без названия"}</h4>

                    <p>
                      Размер: {product.size || "Не указан"} · Цвет:{" "}
                      {product.color || "Не указан"}
                    </p>

                    <p>Количество: {product.quantity || 1} шт.</p>

                    <p>
                      Вес:{" "}
                      {Number(product.weight || 0) *
                        Number(product.quantity || 1)}{" "}
                      кг
                    </p>

                    <strong>
                      {(
                        Number(product.price || 0) *
                        Number(product.quantity || 1)
                      ).toLocaleString("ru-RU")}{" "}
                      сом
                    </strong>
                  </div>
                </div>
              ))}

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

                <p>
                  <span>Общий вес</span> {order.sellerWeight} кг
                </p>

                <p>
                  <span>Сумма товаров</span>{" "}
                  {order.sellerTotalPrice.toLocaleString("ru-RU")} сом
                </p>

                <p>
                  <span>Статус</span> Получено
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

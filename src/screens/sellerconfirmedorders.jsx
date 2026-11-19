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
  const [currentSeller, setCurrentSeller] = useState(null);

  const getOrders = async () => {
    try {
      const uid = localStorage.getItem("uid")?.replaceAll('"', "");

      if (!uid) {
        navigate("/sellersignin");
        return;
      }

      const usersResponse = await axios.get(USERS_URL);

      const seller = usersResponse.data.find(
        (item) => String(item.uid).replaceAll('"', "") === String(uid),
      );

      if (!seller || seller.role !== "seller") {
        navigate("/sellersignin");
        return;
      }

      setCurrentSeller(seller);

      const productsResponse = await axios.get(PRODUCTS_URL);

      const sellerProducts = productsResponse.data.filter(
        (item) => String(item.userId) === String(seller.id),
      );

      const ordersResponse = await axios.get(ORDERS_URL);

      const sellerOrders = [];

      ordersResponse.data.forEach((order) => {
        // Новый формат: заказ содержит storeOrders
        if (Array.isArray(order.storeOrders) && order.storeOrders.length > 0) {
          const myStoreOrder = order.storeOrders.find(
            (item) => String(item.sellerId) === String(seller.id),
          );

          if (myStoreOrder && myStoreOrder.orderstatus === "Подтверждено") {
            sellerOrders.push({
              ...order,
              ...myStoreOrder,
              mainOrderId: order.id,
              id: order.id,
              storeOrder: myStoreOrder,
              orderstatus: myStoreOrder.orderstatus,
              pickupId: order.pickupId,
              statusdostavka: order.statusdostavka,
            });
          }
        } else {
          // Старый формат заказа
          const orderProductIds = Array.isArray(order.productId)
            ? order.productId
            : [order.productId];

          const hasMyProduct = sellerProducts.some((product) =>
            orderProductIds.some(
              (productId) =>
                String(productId) === String(orderProductId(productId)),
            ),
          );

          if (hasMyProduct && order.orderstatus === "Подтверждено") {
            sellerOrders.push(order);
          }
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

  // Возвращает ID товара без изменения
  const orderProductId = (productId) => productId;

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

    const isPickup = order.pickupId && String(order.pickupId) !== "Нет";

    const newStatus = isPickup
      ? "Ожидание пункта передачи"
      : "Ожидание курьера";

    try {
      setCallingId(order.id);

      const latestResponse = await axios.get(
        `${ORDERS_URL}/${order.mainOrderId || order.id}`,
      );

      const latestOrder = latestResponse.data;

      let updatedOrder;

      if (
        Array.isArray(latestOrder.storeOrders) &&
        latestOrder.storeOrders.length > 0
      ) {
        const updatedStoreOrders = [...latestOrder.storeOrders];

        const myStoreIndex = updatedStoreOrders.findIndex(
          (item) => String(item.sellerId) === String(currentSeller?.id),
        );

        if (myStoreIndex === -1) {
          alert("Заказ не принадлежит вашему магазину");
          return;
        }

        if (updatedStoreOrders[myStoreIndex].orderstatus !== "Подтверждено") {
          alert("Этот заказ уже обработан");
          return;
        }

        updatedStoreOrders[myStoreIndex] = {
          ...updatedStoreOrders[myStoreIndex],
          orderstatus: newStatus,
        };

        updatedOrder = {
          ...latestOrder,
          storeOrders: updatedStoreOrders,
          orderstatus: newStatus,
        };
      } else {
        if (latestOrder.orderstatus !== "Подтверждено") {
          alert("Этот заказ уже обработан");
          return;
        }

        updatedOrder = {
          ...latestOrder,
          orderstatus: newStatus,
        };
      }

      await axios.put(
        `${ORDERS_URL}/${order.mainOrderId || order.id}`,
        updatedOrder,
      );

      setOrders((prev) =>
        prev.filter((item) => String(item.id) !== String(order.id)),
      );

      if (isPickup) {
        alert("Заказ ожидает передачи пункту передачи!");
      } else {
        alert("Заказ отправлен на поиск курьера!");
      }
    } catch (error) {
      console.log("Ошибка изменения статуса заказа:", error);
      alert("Не удалось изменить статус заказа");
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
          orders.map((order) => {
            const isPickup = order.pickupId && String(order.pickupId) !== "Нет";

            return (
              <div className="seller-confirmed-card" key={order.id}>
                <div className="seller-confirmed-top">
                  <strong>Заказ № MG-{order.id}</strong>
                  <span>Подтверждён</span>
                </div>

                <div className="seller-confirmed-product">
                  <img
                    src={order.avatar || order.products?.[0]?.avatar}
                    alt={order.name || "Товар"}
                  />

                  <div>
                    <h4>{order.name || order.products?.[0]?.name}</h4>
                    <p>
                      Размер: {order.size || "—"} · Цвет: {order.color || "—"}
                    </p>
                    <strong>
                      {formatPrice(order.totalPrice ?? order.price)} сом
                    </strong>
                  </div>
                </div>

                <div className="seller-confirmed-info">
                  <p>
                    <span>Покупатель</span> {order.firstname} {order.lastname}
                  </p>

                  <p>
                    <span>Количество</span>{" "}
                    {order.quantity ||
                      order.products?.reduce(
                        (sum, product) => sum + Number(product.quantity || 1),
                        0,
                      ) ||
                      1}{" "}
                    шт.
                  </p>

                  <p>
                    <span>{isPickup ? "Адрес пункта передачи" : "Адрес"}</span>{" "}
                    {order.adres || "—"}
                  </p>

                  {isPickup && (
                    <>
                      <p>
                        <span>Номер пункта</span> № {order.pickupId}
                      </p>

                      <p>
                        <span>Получение</span> {order.statusdostavka || "—"}
                      </p>
                    </>
                  )}

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
                    <i
                      className={`fa-solid ${isPickup ? "fa-box" : "fa-truck"}`}
                    ></i>

                    {callingId === order.id
                      ? "Отправка..."
                      : isPickup
                        ? "Передать пункту передачи"
                        : "Вызвать курьера"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <SellerBottomnav />
    </div>
  );
}

export default Sellerconfirmedorders;

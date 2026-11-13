import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SellerBottomnav from "../components/SellerBottomnav";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const PRODUCTS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/products";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Sellercourieraccepted() {
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
        if (Array.isArray(order.storeOrders) && order.storeOrders.length > 0) {
          const storeOrder = order.storeOrders.find(
            (item) => String(item.sellerId) === String(currentSeller.id),
          );

          if (storeOrder && storeOrder.orderstatus === "Получить") {
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

        const orderProductIds = Array.isArray(order.productId)
          ? order.productId.map(String)
          : [String(order.productId)];

        const myProducts = sellerProducts.filter((product) =>
          orderProductIds.includes(String(product.id)),
        );

        if (myProducts.length > 0 && order.orderstatus === "Получить") {
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
      console.log("Ошибка загрузки заказов:", error);
      alert("Не удалось загрузить заказы");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const giveOrderToCourier = async (order) => {
    try {
      if (order.storeOrder) {
        const updatedStoreOrders = order.storeOrders.map((item) =>
          String(item.sellerId) === String(order.storeOrder.sellerId)
            ? { ...item, orderstatus: "Передано" }
            : item,
        );

        await axios.put(`${ORDERS_URL}/${order.id}`, {
          ...order,
          storeOrders: updatedStoreOrders,
          orderstatus: "Передано",
        });
      } else {
        await axios.put(`${ORDERS_URL}/${order.id}`, {
          ...order,
          orderstatus: "Передано",
        });
      }

      setOrders((prev) =>
        prev.filter((item) => String(item.id) !== String(order.id)),
      );

      alert("Заказ передан курьеру!");
    } catch (error) {
      console.log("Ошибка передачи заказа:", error);
      alert("Не удалось передать заказ");
    }
  };

  const formatPrice = (price) => Number(price || 0).toLocaleString("ru-RU");

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
                  {formatPrice(order.sellerTotal)} сом
                </span>
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
                    <h3>{product.name || "Товар"}</h3>
                    <p>Размер: {product.size || "Не указан"}</p>
                    <p>Цвет: {product.color || "Не указан"}</p>
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
                  <i className="fa-solid fa-user"></i>
                  {order.firstname || ""} {order.lastname || ""}
                </p>

                <p>
                  <i className="fa-solid fa-phone"></i>
                  {order.numberphone || "Не указан"}
                </p>

                <p>
                  <i className="fa-solid fa-location-dot"></i>
                  {order.adres || "Адрес не указан"}
                </p>

                <p>
                  <i className="fa-solid fa-weight-hanging"></i>
                  Вес: {order.sellerWeight || 0} кг
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

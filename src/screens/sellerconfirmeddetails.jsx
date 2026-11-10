import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SellerBottomnav from "../components/SellerBottomnav";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const PRODUCTS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/products";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Sellerconfirmeddetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [storeOrder, setStoreOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [buyer, setBuyer] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [currentSeller, setCurrentSeller] = useState(null);

  const getOrder = async () => {
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

      const orderResponse = await axios.get(`${ORDERS_URL}/${id}`);
      const currentOrder = orderResponse.data;

      const productsResponse = await axios.get(PRODUCTS_URL);

      const sellerProducts = productsResponse.data.filter(
        (item) => String(item.userId) === String(seller.id),
      );

      let myProducts = [];
      let myStoreOrder = null;
      let currentStatus = "";

      // Новая структура storeOrders
      if (
        Array.isArray(currentOrder.storeOrders) &&
        currentOrder.storeOrders.length > 0
      ) {
        myStoreOrder = currentOrder.storeOrders.find(
          (item) => String(item.sellerId) === String(seller.id),
        );

        if (!myStoreOrder) {
          alert("Этот заказ не принадлежит вашему магазину");
          navigate("/sellerconfirmedorders");
          return;
        }

        myProducts = (myStoreOrder.products || []).map((orderProduct) => {
          const originalProduct = sellerProducts.find(
            (item) => String(item.id) === String(orderProduct.id),
          );

          return {
            ...orderProduct,
            category: originalProduct?.category || "—",
          };
        });

        currentStatus =
          myStoreOrder.orderstatus || currentOrder.orderstatus || "";
      } else {
        // Поддержка старой структуры
        const orderProductIds = Array.isArray(currentOrder.productId)
          ? currentOrder.productId
          : [currentOrder.productId];

        myProducts = (currentOrder.products || [])
          .filter((orderProduct) =>
            sellerProducts.some(
              (item) => String(item.id) === String(orderProduct.id),
            ),
          )
          .map((orderProduct) => {
            const originalProduct = sellerProducts.find(
              (item) => String(item.id) === String(orderProduct.id),
            );

            return {
              ...originalProduct,
              ...orderProduct,
              category: originalProduct?.category || "—",
            };
          });

        if (myProducts.length === 0) {
          const oldProduct = sellerProducts.find((item) =>
            orderProductIds.some(
              (productId) => String(productId) === String(item.id),
            ),
          );

          if (oldProduct) {
            myProducts = [
              {
                ...oldProduct,
                avatar: currentOrder.avatar || oldProduct.avatar,
                name: currentOrder.name || oldProduct.name,
                price: currentOrder.price,
                quantity: currentOrder.quantity || 1,
                size: currentOrder.size,
                color: currentOrder.color,
              },
            ];
          }
        }

        currentStatus = currentOrder.orderstatus || "";
      }

      if (myProducts.length === 0) {
        alert("Товары заказа не найдены");
        navigate("/sellerconfirmedorders");
        return;
      }

      const currentBuyer = usersResponse.data.find(
        (item) => String(item.id) === String(currentOrder.buyerId),
      );

      setOrder(currentOrder);
      setStoreOrder(myStoreOrder);
      setProducts(myProducts);
      setBuyer(currentBuyer || null);
      setStatus(currentStatus);
    } catch (error) {
      console.log("Ошибка получения заказа:", error);
      alert("Не удалось загрузить заказ");
      navigate("/sellerconfirmedorders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrder();
  }, [id]);

  const formatPrice = (price) => Number(price || 0).toLocaleString("ru-RU");

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("ru-RU");
  };

  const totalQuantity = products.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0,
  );

  const total = Number(
    storeOrder?.totalPrice ??
      order?.totalPrice ??
      products.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      ),
  );

  const totalWeight = Number(
    storeOrder?.allweight ??
      order?.allweight ??
      products.reduce(
        (sum, item) =>
          sum + Number(item.weight || 0) * Number(item.quantity || 1),
        0,
      ),
  );

  const callCourier = async () => {
    if (calling || !order || !currentSeller) return;

    if (status !== "Подтверждено") {
      alert("Этот заказ уже отправлен на следующий этап");
      return;
    }

    try {
      setCalling(true);

      const latestResponse = await axios.get(`${ORDERS_URL}/${id}`);

      const latestOrder = latestResponse.data;

      let updatedOrder;

      // Новая структура storeOrders
      if (
        Array.isArray(latestOrder.storeOrders) &&
        latestOrder.storeOrders.length > 0
      ) {
        const storeIndex = latestOrder.storeOrders.findIndex(
          (item) => String(item.sellerId) === String(currentSeller.id),
        );

        if (storeIndex === -1) {
          alert("Магазин в заказе не найден");
          return;
        }

        if (
          latestOrder.storeOrders[storeIndex].orderstatus !== "Подтверждено"
        ) {
          alert("Этот заказ уже обработан");
          return;
        }

        const updatedStoreOrders = [...latestOrder.storeOrders];

        updatedStoreOrders[storeIndex] = {
          ...updatedStoreOrders[storeIndex],
          orderstatus: "Ожидание курьера",
        };

        updatedOrder = {
          ...latestOrder,
          storeOrders: updatedStoreOrders,
          orderstatus: "Ожидание курьера",
        };
      } else {
        // Старая структура заказа
        if (latestOrder.orderstatus !== "Подтверждено") {
          alert("Этот заказ уже обработан");
          return;
        }

        updatedOrder = {
          ...latestOrder,
          orderstatus: "Ожидание курьера",
        };
      }

      const response = await axios.put(`${ORDERS_URL}/${id}`, updatedOrder);

      setOrder(response.data);

      if (
        Array.isArray(response.data.storeOrders) &&
        response.data.storeOrders.length > 0
      ) {
        const updatedStore = response.data.storeOrders.find(
          (item) => String(item.sellerId) === String(currentSeller.id),
        );

        setStoreOrder(updatedStore || null);
        setStatus(updatedStore?.orderstatus || "Ожидание курьера");
      } else {
        setStatus(response.data.orderstatus);
      }

      alert("Заказ отправлен на поиск курьера!");

      navigate("/sellerconfirmedorders");
    } catch (error) {
      console.log("Ошибка вызова курьера:", error);
      alert("Не удалось вызвать курьера");
    } finally {
      setCalling(false);
    }
  };

  if (loading) {
    return (
      <div className="seller-confirmed-details-page">
        <p>Загрузка заказа...</p>
        <SellerBottomnav />
      </div>
    );
  }

  if (!order || products.length === 0) {
    return (
      <div className="seller-confirmed-details-page">
        <h2>Заказ не найден</h2>
        <Link to="/sellerconfirmedorders">Вернуться к заказам</Link>
        <SellerBottomnav />
      </div>
    );
  }

  return (
    <div className="seller-confirmed-details-page">
      <div className="seller-confirmed-details-header">
        <Link to="/sellerconfirmedorders">
          <i className="fa-solid fa-arrow-left"></i>
          Назад к заказам
        </Link>

        <span>Заказ № MG-{order.id}</span>
      </div>

      <div className="seller-confirmed-details-content">
        <div className="seller-confirmed-details-main">
          <div className="seller-confirmed-details-card">
            <div className="seller-confirmed-details-title">
              <h2>Подтверждённый заказ</h2>
              <span>{status}</span>
            </div>

            {products.map((product, index) => {
              const quantity = Number(product.quantity || 1);
              const productTotal = Number(product.price || 0) * quantity;

              return (
                <div key={product.id || index}>
                  <div className="seller-confirmed-details-product">
                    <img src={product.avatar} alt={product.name || "Товар"} />

                    <div>
                      <h3>{product.name || "Без названия"}</h3>
                      <p>Категория: {product.category || "—"}</p>
                      <p>Размер: {product.size || "—"}</p>
                      <p>Цвет: {product.color || "—"}</p>
                      <p>Количество: {quantity} шт.</p>
                      <p>Вес: {Number(product.weight || 0) * quantity} кг</p>
                      <strong>{formatPrice(productTotal)} сом</strong>
                    </div>
                  </div>

                  {index !== products.length - 1 && (
                    <div className="seller-confirmed-details-line"></div>
                  )}
                </div>
              );
            })}

            <div className="seller-confirmed-details-line"></div>

            <h3 className="seller-confirmed-details-subtitle">
              Информация о покупателе
            </h3>

            <div className="seller-confirmed-details-info">
              <div>
                <span>Имя и фамилия</span>
                <strong>
                  {buyer
                    ? `${buyer.firstname || ""} ${buyer.lastname || ""}`
                    : `${order.firstname || ""} ${order.lastname || ""}`}
                </strong>
              </div>

              <div>
                <span>Телефон</span>
                <strong>
                  {buyer?.numberphone || order.numberphone || "—"}
                </strong>
              </div>

              <div>
                <span>Адрес доставки</span>
                <strong>{buyer?.adres || order.adres || "—"}</strong>
              </div>

              <div>
                <span>Место доставки</span>
                <strong>{buyer?.adres || order.adres || "—"}</strong>
              </div>

              <div>
                <span>Дата заказа</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
            </div>
          </div>

          <div className="seller-confirmed-details-card">
            <h3 className="seller-confirmed-details-subtitle">
              Следующий этап
            </h3>

            <div className="seller-confirmed-details-step">
              <div className="seller-confirmed-details-step-icon">
                <i className="fa-solid fa-truck"></i>
              </div>

              <div>
                <strong>Передача заказа курьеру</strong>
                <p>
                  Вызовите курьера, чтобы он забрал заказ и доставил его
                  покупателю.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="seller-confirmed-details-sidebar">
          <div className="seller-confirmed-details-card">
            <h3 className="seller-confirmed-details-subtitle">Сумма заказа</h3>

            <div className="seller-confirmed-details-total">
              <span>Количество</span>
              <strong>{totalQuantity} шт.</strong>
            </div>

            <div className="seller-confirmed-details-total">
              <span>Общий вес</span>
              <strong>{totalWeight} кг</strong>
            </div>

            <div className="seller-confirmed-details-line"></div>

            <div className="seller-confirmed-details-total final">
              <span>Итого</span>
              <strong>{formatPrice(total)} сом</strong>
            </div>

            <button
              className="seller-confirmed-call-button"
              onClick={callCourier}
              disabled={status !== "Подтверждено" || calling}
            >
              <i className="fa-solid fa-truck"></i>
              {calling ? "Отправка..." : "Вызвать курьера"}
            </button>
          </div>
        </div>
      </div>

      <SellerBottomnav />
    </div>
  );
}

export default Sellerconfirmeddetails;

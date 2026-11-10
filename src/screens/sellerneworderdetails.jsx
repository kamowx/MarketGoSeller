import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SellerBottomnav from "../components/SellerBottomnav";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const PRODUCTS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/products";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Sellerneworderdetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [buyer, setBuyer] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const [currentSeller, setCurrentSeller] = useState(null);
  const [storeOrder, setStoreOrder] = useState(null);

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

      const productResponse = await axios.get(PRODUCTS_URL);

      const sellerProducts = productResponse.data.filter(
        (item) => String(item.userId) === String(seller.id),
      );

      let myProducts = [];
      let myStoreOrder = null;
      let currentStatus = "";

      // Новая структура заказа
      if (
        Array.isArray(currentOrder.storeOrders) &&
        currentOrder.storeOrders.length > 0
      ) {
        myStoreOrder = currentOrder.storeOrders.find(
          (item) => String(item.sellerId) === String(seller.id),
        );

        if (!myStoreOrder) {
          alert("Этот заказ не принадлежит вашему магазину");
          navigate("/sellerneworders");
          return;
        }

        const orderProducts = myStoreOrder.products || [];

        myProducts = orderProducts.map((orderProduct) => {
          const originalProduct = sellerProducts.find(
            (item) => String(item.id) === String(orderProduct.id),
          );

          return {
            ...orderProduct,
            category: originalProduct?.category || "—",
          };
        });

        currentStatus =
          myStoreOrder.orderstatus || currentOrder.orderstatus || "Ожидание";
      } else {
        // Поддержка старой структуры заказа
        const orderProductIds = Array.isArray(currentOrder.productId)
          ? currentOrder.productId
          : [currentOrder.productId];

        myProducts = sellerProducts
          .filter((item) =>
            orderProductIds.some(
              (productId) => String(productId) === String(item.id),
            ),
          )
          .map((item) => {
            const orderProduct = (currentOrder.products || []).find(
              (product) => String(product.id) === String(item.id),
            );

            return {
              ...item,
              ...orderProduct,
              category: item.category || "—",
            };
          });

        // Если в старом заказе нет массива products
        if (myProducts.length === 0) {
          const oldProduct = sellerProducts.find(
            (item) => String(item.id) === String(currentOrder.productId),
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

        currentStatus = currentOrder.orderstatus || "Ожидание";
      }

      if (myProducts.length === 0) {
        alert("Товары этого магазина не найдены");
        navigate("/sellerneworders");
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
      navigate("/sellerneworders");
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

  // Количество всех товаров
  const totalQuantity = products.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0,
  );

  // Общая стоимость товаров
  const total = storeOrder
    ? Number(
        storeOrder.totalPrice ??
          products.reduce(
            (sum, item) =>
              sum + Number(item.price || 0) * Number(item.quantity || 1),
            0,
          ),
      )
    : Number(
        order?.totalPrice ??
          products.reduce(
            (sum, item) =>
              sum + Number(item.price || 0) * Number(item.quantity || 1),
            0,
          ),
      );

  // Общий вес заказа
  const totalWeight = storeOrder
    ? Number(storeOrder.allweight || 0)
    : products.reduce(
        (sum, item) =>
          sum + Number(item.weight || 0) * Number(item.quantity || 1),
        0,
      );

  const confirmOrder = async () => {
    if (confirming || !order || !currentSeller) return;

    if (status !== "Ожидание") {
      alert("Этот заказ уже обработан");
      return;
    }

    try {
      setConfirming(true);

      // Получаем актуальный заказ перед обновлением
      const latestResponse = await axios.get(`${ORDERS_URL}/${id}`);
      const latestOrder = latestResponse.data;

      let updatedOrder;

      // Новая структура storeOrders
      if (
        Array.isArray(latestOrder.storeOrders) &&
        latestOrder.storeOrders.length > 0
      ) {
        const myStoreIndex = latestOrder.storeOrders.findIndex(
          (item) => String(item.sellerId) === String(currentSeller.id),
        );

        if (myStoreIndex === -1) {
          alert("Заказ не принадлежит вашему магазину");
          return;
        }

        if (latestOrder.storeOrders[myStoreIndex].orderstatus !== "Ожидание") {
          alert("Этот заказ уже обработан");
          setStatus(latestOrder.storeOrders[myStoreIndex].orderstatus);
          return;
        }

        const updatedStoreOrders = [...latestOrder.storeOrders];

        updatedStoreOrders[myStoreIndex] = {
          ...updatedStoreOrders[myStoreIndex],
          orderstatus: "Подтверждено",
        };

        updatedOrder = {
          ...latestOrder,
          storeOrders: updatedStoreOrders,
          // Поддерживаем старое поле для совместимости
          orderstatus: "Подтверждено",
        };
      } else {
        // Старая структура заказа
        if (latestOrder.orderstatus !== "Ожидание") {
          alert("Этот заказ уже обработан");
          return;
        }

        updatedOrder = {
          ...latestOrder,
          orderstatus: "Подтверждено",
        };
      }

      const response = await axios.put(`${ORDERS_URL}/${id}`, updatedOrder);

      setOrder(response.data);

      if (
        Array.isArray(response.data.storeOrders) &&
        response.data.storeOrders.length > 0
      ) {
        const updatedMyStore = response.data.storeOrders.find(
          (item) => String(item.sellerId) === String(currentSeller.id),
        );

        setStoreOrder(updatedMyStore || null);
        setStatus(updatedMyStore?.orderstatus || "Подтверждено");
      } else {
        setStatus(response.data.orderstatus);
      }

      alert("Заказ подтверждён!");

      navigate("/sellerconfirmedorders");
    } catch (error) {
      console.log("Ошибка подтверждения заказа:", error);
      alert("Не удалось подтвердить заказ");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="seller-order-details-page">
        <p>Загрузка заказа...</p>
        <SellerBottomnav />
      </div>
    );
  }

  if (!order || products.length === 0) {
    return (
      <div className="seller-order-details-page">
        <h2>Заказ не найден</h2>
        <Link to="/sellerneworders">Вернуться к заказам</Link>
        <SellerBottomnav />
      </div>
    );
  }

  return (
    <div className="seller-order-details-page">
      <div className="seller-order-details-header">
        <Link to="/sellerneworders" className="seller-details-back">
          <i className="fa-solid fa-arrow-left"></i>
          Назад к заказам
        </Link>

        <span className="seller-details-number">Заказ № MG-{order.id}</span>
      </div>

      <div className="seller-details-content">
        <div className="seller-details-main">
          <div className="seller-details-card">
            <div className="seller-details-title">
              <h2>Информация о заказе</h2>
              <span className="seller-details-new">{status}</span>
            </div>

            {products.map((product, index) => {
              const quantity = Number(product.quantity || 1);
              const unitPrice = Number(product.price || 0);
              const productTotal = unitPrice * quantity;

              return (
                <div key={product.id || index}>
                  <div className="seller-details-product">
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
                    <div className="seller-details-divider"></div>
                  )}
                </div>
              );
            })}

            <div className="seller-details-divider"></div>

            <h3 className="seller-details-subtitle">Данные покупателя</h3>

            <div className="seller-details-info">
              <div>
                <span>Имя и фамилия</span>
                <strong>
                  {buyer
                    ? `${buyer.firstname || ""} ${buyer.lastname || ""}`
                    : `${order.firstname || ""} ${order.lastname || ""}`}
                </strong>
              </div>

              <div>
                <span>Номер телефона</span>
                <strong>
                  {buyer?.numberphone || order.numberphone || "—"}
                </strong>
              </div>

              <div>
                <span>Адрес доставки</span>
                <strong>{buyer?.adres || order.adres || "—"}</strong>
              </div>

              <div>
                <span>Место на карте</span>
                <strong>{buyer?.adres || order.adres || "—"}</strong>
              </div>

              <div>
                <span>Дата заказа</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="seller-details-sidebar">
          <div className="seller-details-card">
            <h3 className="seller-details-subtitle">Оплата заказа</h3>

            <div className="seller-details-total">
              <span>Количество товаров</span>
              <strong>{totalQuantity} шт.</strong>
            </div>

            <div className="seller-details-total">
              <span>Общий вес</span>
              <strong>{totalWeight} кг</strong>
            </div>

            <div className="seller-details-divider"></div>

            <div className="seller-details-total seller-details-final">
              <span>Итого</span>
              <strong>{formatPrice(total)} сом</strong>
            </div>

            <button
              className="seller-details-confirm"
              onClick={confirmOrder}
              disabled={status !== "Ожидание" || confirming}
            >
              <i className="fa-solid fa-check"></i>
              {confirming ? "Подтверждение..." : "Подтвердить заказ"}
            </button>

            <Link to="/sellerneworders" className="seller-details-cancel">
              Вернуться назад
            </Link>
          </div>
        </div>
      </div>

      <SellerBottomnav />
    </div>
  );
}

export default Sellerneworderdetails;

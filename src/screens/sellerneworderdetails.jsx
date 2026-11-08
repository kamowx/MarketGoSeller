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
  const [product, setProduct] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const getOrder = async () => {
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

      const orderResponse = await axios.get(`${ORDERS_URL}/${id}`);
      const currentOrder = orderResponse.data;

      const productResponse = await axios.get(PRODUCTS_URL);

      const currentProduct = productResponse.data.find(
        (item) =>
          String(item.id) === String(currentOrder.productId) &&
          String(item.userId) === String(currentSeller.id),
      );

      if (!currentProduct) {
        alert("Этот заказ не найден или не принадлежит вашему магазину");
        navigate("/sellerneworders");
        return;
      }

      const currentBuyer = usersResponse.data.find(
        (item) => String(item.id) === String(currentOrder.buyerId),
      );

      setOrder(currentOrder);
      setProduct(currentProduct);
      setBuyer(currentBuyer || null);
      setStatus(currentOrder.orderstatus);
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

  const confirmOrder = async () => {
    if (confirming || !order) return;

    if (order.orderstatus !== "Ожидание") {
      alert("Этот заказ уже обработан");
      return;
    }

    try {
      setConfirming(true);

      const response = await axios.put(`${ORDERS_URL}/${id}`, {
        ...order,
        orderstatus: "Подтверждено",
      });

      setOrder(response.data);
      setStatus(response.data.orderstatus);

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

  if (!order || !product) {
    return (
      <div className="seller-order-details-page">
        <h2>Заказ не найден</h2>
        <Link to="/sellerneworders">Вернуться к заказам</Link>
        <SellerBottomnav />
      </div>
    );
  }

  const quantity = Number(order.quantity || 1);
  const total = Number(order.price || 0);
  const unitPrice = total / quantity;

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

            <div className="seller-details-product">
              <img src={order.avatar || product.avatar} alt={order.name} />

              <div>
                <h3>{order.name}</h3>
                <p>Категория: {product.category || "—"}</p>
                <p>Размер: {order.size || "—"}</p>
                <p>Цвет: {order.color || "—"}</p>
                <p>Количество: {quantity} шт.</p>
                <strong>{formatPrice(total)} сом</strong>
              </div>
            </div>

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
              <span>Стоимость товара</span>
              <strong>{formatPrice(unitPrice)} сом</strong>
            </div>

            <div className="seller-details-total">
              <span>Количество</span>
              <strong>{quantity} шт.</strong>
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

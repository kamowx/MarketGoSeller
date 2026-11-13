import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SellerBottomnav from "../components/SellerBottomnav";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const PRODUCTS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/products";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Sellercourierdetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [products, setProducts] = useState([]);
  const [storeOrder, setStoreOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [giving, setGiving] = useState(false);

  const getOrder = async () => {
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

      const [orderResponse, productsResponse] = await Promise.all([
        axios.get(`${ORDERS_URL}/${id}`),
        axios.get(PRODUCTS_URL),
      ]);

      const currentOrder = orderResponse.data;
      const allProducts = productsResponse.data;

      let myStoreOrder = null;
      let myOrderProducts = [];

      if (
        Array.isArray(currentOrder.storeOrders) &&
        currentOrder.storeOrders.length > 0
      ) {
        myStoreOrder = currentOrder.storeOrders.find(
          (item) => String(item.sellerId) === String(currentSeller.id),
        );

        if (!myStoreOrder) {
          alert("Этот заказ не принадлежит вашему магазину");
          navigate("/sellercourierorders");
          return;
        }

        myOrderProducts = (myStoreOrder.products || []).map((item) => {
          const productInfo = allProducts.find(
            (product) => String(product.id) === String(item.id),
          );

          return {
            ...item,
            category: productInfo?.category || "—",
          };
        });
      } else {
        const sellerProducts = allProducts.filter(
          (item) => String(item.userId) === String(currentSeller.id),
        );

        const productIds = Array.isArray(currentOrder.productId)
          ? currentOrder.productId.map(String)
          : [String(currentOrder.productId)];

        myOrderProducts = (currentOrder.products || [])
          .filter(
            (item) =>
              productIds.includes(String(item.id)) &&
              sellerProducts.some(
                (product) => String(product.id) === String(item.id),
              ),
          )
          .map((item) => {
            const productInfo = allProducts.find(
              (product) => String(product.id) === String(item.id),
            );

            return {
              ...item,
              category: productInfo?.category || "—",
            };
          });
      }

      const buyerUser = usersResponse.data.find(
        (item) => String(item.id) === String(currentOrder.buyerId),
      );

      setOrder(currentOrder);
      setBuyer(buyerUser || null);
      setProducts(myOrderProducts);
      setStoreOrder(myStoreOrder);
    } catch (error) {
      console.log("Ошибка загрузки заказа:", error);
      alert("Не удалось загрузить заказ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrder();
  }, [id]);

  const formatPrice = (price) => Number(price || 0).toLocaleString("ru-RU");

  const totalQuantity = products.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0,
  );

  const totalPrice = storeOrder
    ? Number(storeOrder.totalPrice || 0)
    : products.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      );

  const totalWeight = storeOrder
    ? Number(storeOrder.allweight || 0)
    : products.reduce(
        (sum, item) =>
          sum + Number(item.weight || 0) * Number(item.quantity || 1),
        0,
      );

  const giveOrder = async () => {
    if (!order || giving) return;

    try {
      setGiving(true);

      if (storeOrder) {
        const updatedStoreOrders = order.storeOrders.map((item) =>
          String(item.sellerId) === String(storeOrder.sellerId)
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

      alert("Заказ передан курьеру!");
      navigate("/seller/completed-orders");
    } catch (error) {
      console.log("Ошибка передачи заказа:", error);
      alert("Не удалось передать заказ курьеру");
    } finally {
      setGiving(false);
    }
  };

  if (loading) {
    return (
      <div className="seller-courier-details-page">
        <p>Загрузка заказа...</p>
        <SellerBottomnav />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="seller-courier-details-page">
        <h2>Заказ не найден</h2>
        <Link to="/sellercourierorders">Назад к заказам</Link>
        <SellerBottomnav />
      </div>
    );
  }

  return (
    <div className="seller-courier-details-page">
      <div className="seller-courier-details-header">
        <Link to="/sellercourierorders">
          <i className="fa-solid fa-arrow-left"></i>
          Назад к заказам
        </Link>

        <span>Заказ № MG-{order.id}</span>
      </div>

      <div className="seller-courier-details-content">
        <div className="seller-courier-details-main">
          <div className="seller-courier-details-card">
            <div className="seller-courier-details-title">
              <h2>Информация о заказе</h2>
              <span>{storeOrder?.orderstatus || order.orderstatus}</span>
            </div>

            {products.map((product, index) => (
              <div
                className="seller-courier-details-product"
                key={product.id || index}
              >
                <img src={product.avatar || ""} alt={product.name || "Товар"} />

                <div>
                  <h3>{product.name || "Товар"}</h3>
                  <p>Категория: {product.category || "—"}</p>
                  <p>Размер: {product.size || "—"}</p>
                  <p>Цвет: {product.color || "—"}</p>
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

            <div className="seller-courier-details-line"></div>

            <h3 className="seller-courier-details-subtitle">
              Данные покупателя
            </h3>

            <div className="seller-courier-details-info">
              <div>
                <span>Имя и фамилия</span>
                <strong>
                  {buyer?.firstname || order.firstname || "—"}{" "}
                  {buyer?.lastname || order.lastname || ""}
                </strong>
              </div>

              <div>
                <span>Телефон</span>
                <strong>{order.numberphone || "—"}</strong>
              </div>

              <div>
                <span>Адрес доставки</span>
                <strong>{order.adres || "Адрес не указан"}</strong>
              </div>
            </div>
          </div>

          <div className="seller-courier-details-card">
            <h3 className="seller-courier-details-subtitle">
              Информация о курьере
            </h3>

            <div className="seller-courier-profile">
              <div className="seller-courier-avatar">
                <i className="fa-solid fa-user"></i>
              </div>

              <div>
                <h4>{order.courierName || "Курьер не указан"}</h4>
                <p>Курьер MarketGo</p>
              </div>
            </div>

            <div className="seller-courier-details-info">
              <div>
                <span>Номер телефона</span>
                <strong>{order.courierPhone || "—"}</strong>
              </div>

              <div>
                <span>Транспорт</span>
                <strong>{order.courierTransport || "—"}</strong>
              </div>

              <div>
                <span>Статус</span>
                <strong>{storeOrder?.orderstatus || order.orderstatus}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="seller-courier-details-sidebar">
          <div className="seller-courier-details-card">
            <h3 className="seller-courier-details-subtitle">Передача заказа</h3>

            <div className="seller-courier-details-total">
              <span>Стоимость товаров</span>
              <strong>{formatPrice(totalPrice)} сом</strong>
            </div>

            <div className="seller-courier-details-total">
              <span>Количество</span>
              <strong>{totalQuantity} шт.</strong>
            </div>

            <div className="seller-courier-details-total">
              <span>Общий вес</span>
              <strong>{totalWeight} кг</strong>
            </div>

            <div className="seller-courier-details-line"></div>

            <div className="seller-courier-details-total final">
              <span>Итого</span>
              <strong>{formatPrice(totalPrice)} сом</strong>
            </div>

            <button
              className="seller-courier-give-button"
              onClick={giveOrder}
              disabled={giving}
            >
              <i className="fa-solid fa-box"></i>
              {giving ? "Передача..." : "Отдать заказ курьеру"}
            </button>

            <p className="seller-courier-give-description">
              Нажмите кнопку после того, как фактически передадите товар
              курьеру.
            </p>
          </div>
        </div>
      </div>

      <SellerBottomnav />
    </div>
  );
}

export default Sellercourierdetails;

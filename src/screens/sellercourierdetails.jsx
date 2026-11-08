import { Link, useParams, useNavigate } from "react-router-dom";
import SellerBottomnav from "../components/SellerBottomnav";

function Sellercourierdetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const giveOrder = () => {
    alert("Заказ передан курьеру!");
    navigate("/seller/completed-orders");
  };

  return (
    <div className="seller-courier-details-page">
      <div className="seller-courier-details-header">
        <Link to="/seller/courier-orders">
          <i className="fa-solid fa-arrow-left"></i>
          Назад к заказам
        </Link>

        <span>Заказ № MG-{id || "1019"}</span>
      </div>

      <div className="seller-courier-details-content">
        <div className="seller-courier-details-main">
          <div className="seller-courier-details-card">
            <div className="seller-courier-details-title">
              <h2>Информация о заказе</h2>
              <span>Курьер назначен</span>
            </div>

            <div className="seller-courier-details-product">
              <img
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"
                alt="Футболка"
              />

              <div>
                <h3>Базовая футболка</h3>
                <p>Категория: Мужская одежда</p>
                <p>Размер: M</p>
                <p>Цвет: Чёрный</p>
                <p>Количество: 1 шт.</p>
                <strong>1 200 сом</strong>
              </div>
            </div>

            <div className="seller-courier-details-line"></div>

            <h3 className="seller-courier-details-subtitle">
              Данные покупателя
            </h3>

            <div className="seller-courier-details-info">
              <div>
                <span>Имя и фамилия</span>
                <strong>Иван Иванов</strong>
              </div>

              <div>
                <span>Телефон</span>
                <strong>+996 700 123 456</strong>
              </div>

              <div>
                <span>Адрес доставки</span>
                <strong>г. Бишкек, ул. Киевская, 100</strong>
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
                <h4>Руслан Абдиев</h4>
                <p>Курьер MarketGo</p>
              </div>
            </div>

            <div className="seller-courier-details-info">
              <div>
                <span>Номер телефона</span>
                <strong>+996 700 111 222</strong>
              </div>

              <div>
                <span>Транспорт</span>
                <strong>Мотоцикл</strong>
              </div>

              <div>
                <span>Статус</span>
                <strong>Ожидает передачу заказа</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="seller-courier-details-sidebar">
          <div className="seller-courier-details-card">
            <h3 className="seller-courier-details-subtitle">Передача заказа</h3>

            <div className="seller-courier-details-total">
              <span>Стоимость товара</span>
              <strong>1 200 сом</strong>
            </div>

            <div className="seller-courier-details-total">
              <span>Количество</span>
              <strong>1 шт.</strong>
            </div>

            <div className="seller-courier-details-line"></div>

            <div className="seller-courier-details-total final">
              <span>Итого</span>
              <strong>1 200 сом</strong>
            </div>

            <button className="seller-courier-give-button" onClick={giveOrder}>
              <i className="fa-solid fa-box"></i>
              Отдать заказ курьеру
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

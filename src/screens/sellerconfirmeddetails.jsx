import { Link, useParams } from "react-router-dom";
import SellerBottomnav from "../components/SellerBottomnav";

function Sellerconfirmeddetails() {
  const { id } = useParams();

  const callCourier = () => {
    alert("Заявка на вызов курьера отправлена!");
  };

  return (
    <div className="seller-confirmed-details-page">
      <div className="seller-confirmed-details-header">
        <Link to="/seller/confirmed-orders">
          <i className="fa-solid fa-arrow-left"></i>
          Назад к заказам
        </Link>

        <span>Заказ № MG-{id || "1022"}</span>
      </div>

      <div className="seller-confirmed-details-content">
        <div className="seller-confirmed-details-main">
          <div className="seller-confirmed-details-card">
            <div className="seller-confirmed-details-title">
              <h2>Подтверждённый заказ</h2>
              <span>Подтверждён</span>
            </div>

            <div className="seller-confirmed-details-product">
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

            <div className="seller-confirmed-details-line"></div>

            <h3 className="seller-confirmed-details-subtitle">
              Информация о покупателе
            </h3>

            <div className="seller-confirmed-details-info">
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

              <div>
                <span>Место доставки</span>
                <strong>Бишкек, Кыргызстан</strong>
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
              <span>Стоимость товара</span>
              <strong>1 200 сом</strong>
            </div>

            <div className="seller-confirmed-details-total">
              <span>Количество</span>
              <strong>1 шт.</strong>
            </div>

            <div className="seller-confirmed-details-line"></div>

            <div className="seller-confirmed-details-total final">
              <span>Итого</span>
              <strong>1 200 сом</strong>
            </div>

            <button
              className="seller-confirmed-call-button"
              onClick={callCourier}
            >
              <i className="fa-solid fa-truck"></i>
              Вызвать курьера
            </button>
          </div>
        </div>
      </div>

      <SellerBottomnav />
    </div>
  );
}

export default Sellerconfirmeddetails;

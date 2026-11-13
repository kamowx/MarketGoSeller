import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const BUSINESS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/buisness";

function Sellercheck() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const uid = localStorage.getItem("uid");

      if (!uid) {
        navigate("/sellersignin", { replace: true });
        return;
      }

      try {
        const userResponse = await axios.get(USER_URL);

        const currentUser = userResponse.data.find((item) => item.uid === uid);

        if (!currentUser || currentUser.role !== "seller") {
          localStorage.removeItem("uid");
          navigate("/sellersignin", { replace: true });
          return;
        }

        if (currentUser.status === "Новый") {
          navigate("/sellerinfo", { replace: true });
          return;
        }

        if (
          currentUser.status === "Подтверждено" ||
          currentUser.status === "Подтвержденный"
        ) {
          navigate("/sellerprofile", { replace: true });
          return;
        }

        if (currentUser.status !== "Ожидание") {
          alert("Неизвестный статус продавца");
          navigate("/sellersignin", { replace: true });
          return;
        }

        setUser(currentUser);

        const businessResponse = await axios.get(BUSINESS_URL);

        const currentBusiness = businessResponse.data.find(
          (item) => String(item.userId) === String(currentUser.id),
        );

        setBusiness(currentBusiness || null);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        alert("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("uid");
    navigate("/signin");
  };

  if (loading) {
    return <div className="seller-check-page">Загрузка...</div>;
  }

  return (
    <div className="seller-check-page">
      <div className="seller-check-header">
        <Link to="/" className="seller-check-logo">
          <i className="fa-solid fa-bag-shopping"></i>
          MarketGo
        </Link>

        <Link to="/signin" className="seller-check-exit" onClick={logout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          Выйти
        </Link>
      </div>

      <main className="seller-check-main">
        <div className="seller-check-top">
          <span className="seller-check-label">АККАУНТ ПРОДАВЦА</span>

          <h1>Проверка аккаунта</h1>

          <p>
            Ваша заявка на регистрацию магазина получена. Администрация MarketGo
            проверит информацию и сообщит результат.
          </p>
        </div>

        <div className="seller-check-card">
          <div className="seller-check-card-header">
            <div>
              <span>ИНФОРМАЦИЯ О ПРОДАВЦЕ</span>
              <h2>Данные аккаунта</h2>
            </div>

            <span className="seller-check-number">№ {user?.id || "0001"}</span>
          </div>

          <div className="seller-check-information">
            <div className="seller-check-information-item">
              <div className="seller-check-information-icon">
                <i className="fa-solid fa-user"></i>
              </div>

              <div>
                <span>Имя</span>
                <h3>{user?.firstname || "Не указано"}</h3>
              </div>
            </div>

            <div className="seller-check-information-item">
              <div className="seller-check-information-icon">
                <i className="fa-solid fa-user"></i>
              </div>

              <div>
                <span>Фамилия</span>
                <h3>{user?.lastname || "Не указано"}</h3>
              </div>
            </div>

            <div className="seller-check-information-item">
              <div className="seller-check-information-icon">
                <i className="fa-solid fa-store"></i>
              </div>

              <div>
                <span>Название магазина</span>
                <h3>{business?.name || "Не указано"}</h3>
              </div>
            </div>

            <div className="seller-check-information-item">
              <div className="seller-check-information-icon">
                <i className="fa-solid fa-phone"></i>
              </div>

              <div>
                <span>Номер телефона</span>
                <h3>{user?.numberphone || "Не указано"}</h3>
              </div>
            </div>

            <div className="seller-check-information-item seller-check-address">
              <div className="seller-check-information-icon">
                <i className="fa-solid fa-location-dot"></i>
              </div>

              <div>
                <span>Адрес магазина</span>
                <h3>{business?.adrescompany || "Не указано"}</h3>
              </div>
            </div>
          </div>

          <div className="seller-check-status">
            <div className="seller-check-status-top">
              <div className="seller-check-status-icon">
                <i className="fa-solid fa-clock"></i>
              </div>

              <div>
                <span>ТЕКУЩИЙ СТАТУС</span>
                <h3>На проверке</h3>
              </div>

              <span className="seller-check-status-badge">{user?.status}</span>
            </div>

            <p>
              Ваша заявка находится на рассмотрении. После проверки
              администрацией статус аккаунта будет обновлён.
            </p>
          </div>

          <div className="seller-check-footer">
            <i className="fa-solid fa-circle-info"></i>
            <p>MarketGo.</p>
          </div>
        </div>

        <div className="seller-check-bottom">
          <span>MARKETGO</span>
          <span>Платформа для продавцов</span>
        </div>
      </main>
    </div>
  );
}

export default Sellercheck;

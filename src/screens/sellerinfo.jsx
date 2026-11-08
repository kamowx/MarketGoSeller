import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const BUSINESS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/buisness";

function Sellerinfo() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [numberphone, setNumberphone] = useState("");
  const [adres, setAdres] = useState("");

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [category, setCategory] = useState("");
  const [adrescompany, setAdrescompany] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const uid = localStorage.getItem("uid");

      if (!uid) {
        navigate("/sellersignin", { replace: true });
        return;
      }

      try {
        const response = await axios.get(USER_URL);

        const currentUser = response.data.find((item) => item.uid === uid);

        if (!currentUser || currentUser.role !== "seller") {
          localStorage.removeItem("uid");
          navigate("/sellersignin", { replace: true });
          return;
        }

        if (currentUser.status === "Ожидание") {
          navigate("/sellercheck", { replace: true });
          return;
        }

        if (
          currentUser.status === "Подтверждено" ||
          currentUser.status === "Подтвержденный"
        ) {
          navigate("/sellerprofile", { replace: true });
          return;
        }

        if (currentUser.status !== "Новый") {
          alert("Неизвестный статус продавца");
          navigate("/sellersignin", { replace: true });
          return;
        }

        setUser(currentUser);

        setFirstname(currentUser.firstname || "");
        setLastname(currentUser.lastname || "");
        setNumberphone(currentUser.numberphone || "");
        setAdres(currentUser.adres || "");
      } catch (error) {
        console.error("Ошибка проверки пользователя:", error);
        alert("Не удалось загрузить данные пользователя");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  const handleSubmit = async () => {
    if (
      !firstname.trim() ||
      !lastname.trim() ||
      !numberphone.trim() ||
      !adres.trim() ||
      !name.trim() ||
      !category ||
      !adrescompany.trim()
    ) {
      alert("Заполните все обязательные поля");
      return;
    }

    if (!user) {
      alert("Пользователь не найден");
      return;
    }

    try {
      setSaving(true);

      await axios.put(`${USER_URL}/${user.id}`, {
        ...user,
        firstname,
        lastname,
        numberphone,
        adres,
      });

      const businessResponse = await axios.get(BUSINESS_URL);

      const existingBusiness = businessResponse.data.find(
        (item) => String(item.userId) === String(user.id),
      );

      const businessData = {
        userId: user.id,
        createdAt: existingBusiness?.createdAt || new Date().toISOString(),
        name,
        avatar,
        category,
        adrescompany,
      };

      if (existingBusiness) {
        await axios.put(`${BUSINESS_URL}/${existingBusiness.id}`, businessData);
      } else {
        await axios.post(BUSINESS_URL, businessData);
      }

      await axios.put(`${USER_URL}/${user.id}`, {
        ...user,
        firstname,
        lastname,
        numberphone,
        adres,
        status: "Ожидание",
      });

      alert("Данные отправлены на проверку!");
      navigate("/sellercheck");
    } catch (error) {
      console.error("Ошибка отправки данных:", error);
      alert("Не удалось отправить данные. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="checkout-page">Загрузка...</div>;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-left">
          <p className="checkout-small-title">MarketGo / Данные об бизнесе</p>

          <div className="admin-signup-logo">
            MarketGo<span>.</span>
          </div>

          <h1>
            ДАННЫЕ
            <br />
            магазина
          </h1>

          <p className="checkout-description">
            Остался последний шаг! Заполните данные что-бы начать продвигать или
            продовать свой товар
          </p>

          <div className="checkout-decoration">ВАШ СТИЛЬ. ВАШ ВЫБОР.</div>
        </div>

        <div className="checkout-right">
          <div className="checkout-form">
            <p className="checkout-form-label">БИЗНЕС</p>

            <h2>ДАННЫЕ ДЛЯ РАБОТУ</h2>

            <p className="checkout-form-description">
              Укажите свои контактные данные.
            </p>

            <div className="checkout-name-row">
              <div className="checkout-field">
                <label>Имя</label>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </div>

              <div className="checkout-field">
                <label>Фамилия</label>
                <input
                  type="text"
                  placeholder="Ваша фамилия"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </div>
            </div>

            <div className="checkout-field">
              <label>Номер телефона</label>
              <input
                type="tel"
                placeholder="+996 XXX XXX XXX"
                value={numberphone}
                onChange={(e) => setNumberphone(e.target.value)}
              />
            </div>

            <div className="checkout-field">
              <label>Адрес проживания</label>
              <input
                type="text"
                placeholder="Город, улица, дом, квартира"
                value={adres}
                onChange={(e) => setAdres(e.target.value)}
              />
            </div>

            <br />

            <p className="checkout-form-description">
              Укажите данные об бизнесе.
            </p>

            <div className="checkout-field">
              <label>Имя бизнеса</label>
              <input
                type="text"
                placeholder="MARKET №1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="checkout-field">
              <label>Категория бизнеса</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Выберите категорию бизнеса</option>
                <option value="Одежда">Одежда</option>
                <option value="Обувь">Обувь</option>
                <option value="Аксессуары">Аксессуары</option>
                <option value="Сумки">Сумки</option>
                <option value="Спортивные товары">Спортивные товары</option>
                <option value="Другое">Другое</option>
              </select>
            </div>

            <div className="checkout-field">
              <label>Адрес нахождения бизнеса</label>
              <input
                type="text"
                placeholder="Город, улица, дом, квартира"
                value={adrescompany}
                onChange={(e) => setAdrescompany(e.target.value)}
              />
            </div>

            <div className="checkout-field">
              <label>Ссылка на логотип магазина</label>
              <input
                type="text"
                placeholder="https://..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
            </div>

            <button
              className="checkout-button"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Отправка..." : "Отправить на проверку"}
              <span>→</span>
            </button>
          </div>

          <p className="checkout-footer">STYLESTORE © 2026</p>
        </div>
      </div>
    </div>
  );
}

export default Sellerinfo;

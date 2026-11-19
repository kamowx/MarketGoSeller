import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import SellerBottomnav from "../components/SellerBottomnav";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const BUSINESS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/buisness";

function Sellerprofile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);

  const [showBusiness, setShowBusiness] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState({
    name: "",
    avatar: "",
    adrescompany: "",
  });

  const [saving, setSaving] = useState(false);

  // ДОБАВЛЕНО: состояние личных данных
  const [showProfile, setShowProfile] = useState(false);

  const [editingProfile, setEditingProfile] = useState({
    firstname: "",
    lastname: "",
    numberphone: "",
    city: "",
  });

  const getSellerData = async () => {
    const uid = localStorage.getItem("uid");

    if (!uid) {
      navigate("/sellersignin", { replace: true });
      return;
    }

    try {
      const usersResponse = await axios.get(USERS_URL);

      const currentUser = usersResponse.data.find(
        (item) => String(item.uid) === String(uid),
      );

      if (!currentUser || currentUser.role !== "seller") {
        localStorage.removeItem("uid");
        navigate("/sellersignin", { replace: true });
        return;
      }

      if (currentUser.status === "Новый") {
        navigate("/sellerinfo", { replace: true });
        return;
      }

      if (currentUser.status === "Ожидание") {
        navigate("/sellercheck", { replace: true });
        return;
      }

      if (
        currentUser.status !== "Подтвержденный" &&
        currentUser.status !== "Подтверждено"
      ) {
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
      console.error("ОШИБКА ПОЛУЧЕНИЯ ДАННЫХ:", error);
      alert("Не удалось загрузить данные профиля");
    }
  };

  useEffect(() => {
    getSellerData();
  }, []);

  const openBusiness = () => {
    if (!business) {
      alert("Информация о магазине не найдена");
      return;
    }

    setEditingBusiness({
      name: business.name || "",
      avatar: business.avatar || "",
      adrescompany: business.adrescompany || "",
    });

    setShowBusiness(true);
  };

  const updateBusiness = async (e) => {
    e.preventDefault();

    if (!editingBusiness.name.trim()) {
      alert("Введите название магазина");
      return;
    }

    if (!editingBusiness.adrescompany.trim()) {
      alert("Введите адрес магазина");
      return;
    }

    try {
      setSaving(true);

      const response = await axios.put(`${BUSINESS_URL}/${business.id}`, {
        ...business,
        name: editingBusiness.name,
        avatar: editingBusiness.avatar,
        adrescompany: editingBusiness.adrescompany,
      });

      setBusiness(response.data);
      setShowBusiness(false);

      alert("Информация о магазине обновлена!");
    } catch (error) {
      console.error("ОШИБКА ОБНОВЛЕНИЯ МАГАЗИНА:", error);
      alert("Не удалось обновить магазин");
    } finally {
      setSaving(false);
    }
  };

  // ДОБАВЛЕНО: открытие редактирования личных данных
  const openProfile = () => {
    if (!user) return;

    setEditingProfile({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      numberphone: user.numberphone || "",
      city: user.city || "",
    });

    setShowProfile(true);
  };

  // ДОБАВЛЕНО: сохранение личных данных
  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await axios.put(`${USERS_URL}/${user.id}`, {
        ...user,
        firstname: editingProfile.firstname,
        lastname: editingProfile.lastname,
        numberphone: editingProfile.numberphone,
        city: editingProfile.city,
      });

      setUser(response.data);
      setShowProfile(false);

      alert("Личные данные обновлены!");
    } catch (error) {
      console.error("ОШИБКА ОБНОВЛЕНИЯ ПРОФИЛЯ:", error);
      alert("Не удалось обновить данные");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="seller-profile-page">
      <SellerBottomnav />

      <div className="seller-profile-container">
        <div className="seller-profile-header">
          <div>
            <span>КАБИНЕТ ПРОДАВЦА</span>
            <h1>Мой профиль</h1>
            <p>Управляйте информацией своего аккаунта</p>
          </div>

          <div className="seller-profile-avatar">
            <i className="fa-solid fa-user"></i>
          </div>
        </div>

        <div className="seller-profile-card">
          <div className="seller-profile-card-title">
            <div>
              <h2>Личная информация</h2>
              <p>Данные вашего аккаунта продавца</p>
            </div>

            <i className="fa-solid fa-user-pen"></i>
          </div>

          <div className="seller-profile-info">
            <div className="seller-profile-info-item">
              <span>Имя</span>
              <h3>{user?.firstname || "Не указано"}</h3>
            </div>

            <div className="seller-profile-info-item">
              <span>Фамилия</span>
              <h3>{user?.lastname || "Не указана"}</h3>
            </div>

            <div className="seller-profile-info-item">
              <span>Название магазина</span>
              <h3>{business?.name || "Не указано"}</h3>
            </div>

            <div className="seller-profile-info-item">
              <span>Номер телефона</span>
              <h3>{user?.numberphone || "Не указан"}</h3>
            </div>

            <div className="seller-profile-info-item ">
              <span>Адрес магазина</span>
              <h3>{business?.adrescompany || "Не указан"}</h3>
            </div>
            <div className="seller-profile-info-item ">
              <span>Город</span>
              <h3>{user?.city || "Не указан"}</h3>
            </div>
            <div className="seller-profile-info-item seller-profile-full">
              <span>Баланс</span>
              <h3>{user?.balance || "Не указан"}</h3>
            </div>
          </div>
        </div>

        <div className="seller-profile-actions">
          <Link
            to=""
            className="seller-profile-action"
            onClick={(e) => {
              e.preventDefault();
              openBusiness();
            }}
          >
            <div className="seller-profile-action-icon">
              <i className="fa-solid fa-store"></i>
            </div>

            <div>
              <h3>Мой магазин</h3>
              <p>Информация о вашем магазине</p>
            </div>

            <i className="fa-solid fa-chevron-right"></i>
          </Link>

          <Link to="/seller/products" className="seller-profile-action">
            <div className="seller-profile-action-icon">
              <i className="fa-solid fa-box"></i>
            </div>

            <div>
              <h3>Мои товары</h3>
              <p>Управление товарами магазина</p>
            </div>

            <i className="fa-solid fa-chevron-right"></i>
          </Link>

          <Link
            to=""
            className="seller-profile-action"
            onClick={(e) => {
              e.preventDefault();
              openProfile();
            }}
          >
            <div className="seller-profile-action-icon">
              <i className="fa-solid fa-pen-to-square"></i>
            </div>

            <div>
              <h3>Мои данные</h3>
              <p>Изменение информации о пункте передачи</p>
            </div>

            <i className="fa-solid fa-chevron-right"></i>
          </Link>

          <button
            className="seller-profile-logout"
            onClick={() => {
              localStorage.removeItem("uid");
              navigate("/");
            }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            Выйти из аккаунта
          </button>
        </div>
      </div>

      {showBusiness && (
        <div
          className="seller-business-modal-overlay"
          onClick={() => setShowBusiness(false)}
        >
          <form
            className="seller-business-modal"
            onSubmit={updateBusiness}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="seller-business-modal-close"
              onClick={() => setShowBusiness(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="seller-business-modal-title">
              <div className="seller-business-modal-icon">
                <i className="fa-solid fa-store"></i>
              </div>

              <h2>Мой магазин</h2>
              <p>Информация и настройки вашего магазина</p>
            </div>

            <div className="seller-business-modal-image">
              {editingBusiness.avatar ? (
                <img src={editingBusiness.avatar} alt="Фото магазина" />
              ) : (
                <i className="fa-solid fa-store"></i>
              )}
            </div>

            <label>Название компании</label>
            <input
              type="text"
              value={editingBusiness.name}
              onChange={(e) =>
                setEditingBusiness({
                  ...editingBusiness,
                  name: e.target.value,
                })
              }
              placeholder="Название магазина"
            />

            <label>Фото магазина (ссылка)</label>
            <input
              type="text"
              value={editingBusiness.avatar}
              onChange={(e) =>
                setEditingBusiness({
                  ...editingBusiness,
                  avatar: e.target.value,
                })
              }
              placeholder="https://example.com/image.jpg"
            />

            <label>Адрес магазина</label>
            <input
              type="text"
              value={editingBusiness.adrescompany}
              onChange={(e) =>
                setEditingBusiness({
                  ...editingBusiness,
                  adrescompany: e.target.value,
                })
              }
              placeholder="Введите адрес магазина"
            />

            <button
              type="submit"
              className="seller-business-modal-save"
              disabled={saving}
            >
              <i className="fa-solid fa-check"></i>
              {saving ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </form>
        </div>
      )}

      {/* ДОБАВЛЕНО: модальное окно личных данных */}
      {showProfile && (
        <div
          className="seller-business-modal-overlay"
          onClick={() => setShowProfile(false)}
        >
          <form
            className="seller-business-modal"
            onSubmit={updateProfile}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="seller-business-modal-close"
              onClick={() => setShowProfile(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="seller-business-modal-title">
              <div className="seller-business-modal-icon">
                <i className="fa-solid fa-user-pen"></i>
              </div>

              <h2>Мои данные</h2>
              <p>Редактирование личной информации</p>
            </div>

            <label>Имя</label>
            <input
              type="text"
              value={editingProfile.firstname}
              onChange={(e) =>
                setEditingProfile({
                  ...editingProfile,
                  firstname: e.target.value,
                })
              }
              placeholder="Введите имя"
            />

            <label>Фамилия</label>
            <input
              type="text"
              value={editingProfile.lastname}
              onChange={(e) =>
                setEditingProfile({
                  ...editingProfile,
                  lastname: e.target.value,
                })
              }
              placeholder="Введите фамилию"
            />

            <label>Номер телефона</label>
            <input
              type="text"
              value={editingProfile.numberphone}
              onChange={(e) =>
                setEditingProfile({
                  ...editingProfile,
                  numberphone: e.target.value,
                })
              }
              placeholder="Введите номер телефона"
            />

            <label>Город</label>
            <select
              value={editingProfile.city}
              onChange={(e) =>
                setEditingProfile({
                  ...editingProfile,
                  city: e.target.value,
                })
              }
            >
              <option value="">Выберите город</option>
              <option value="Бишкек">Бишкек</option>
              <option value="Ош">Ош</option>
              <option value="Джалал-Абад">Джалал-Абад</option>
              <option value="Каракол">Каракол</option>
              <option value="Токмок">Токмок</option>
              <option value="Нарын">Нарын</option>
              <option value="Талас">Талас</option>
              <option value="Баткен">Баткен</option>
            </select>

            <button
              type="submit"
              className="seller-business-modal-save"
              disabled={saving}
            >
              <i className="fa-solid fa-check"></i>
              {saving ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Sellerprofile;

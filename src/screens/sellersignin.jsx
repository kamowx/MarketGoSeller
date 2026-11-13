import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase-config";
import axios from "axios";

const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";

function Sellerignin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  const allUser = async () => {
    try {
      const response = await axios.get(USER_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    }
  };

  const getUserByUid = async (uid) => {
    const response = await axios.get(USER_URL);

    return response.data.find((item) => item.uid === uid);
  };

  const createUser = async (userData) => {
    const response = await axios.post(USER_URL, userData);

    return response.data;
  };

  const checkStatus = (user) => {
    if (user.status === "Новый") {
      navigate("/sellerinfo");
    } else if (user.status === "Ожидание") {
      navigate("/sellercheck");
    } else if (user.status === "Подтвержденный") {
      navigate("/sellerprofile");
    } else {
      alert("Неизвестный статус продавца");
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      let existingUser = await getUserByUid(googleUser.uid);

      if (!existingUser) {
        const nameParts = (googleUser.displayName || "").split(" ");

        existingUser = await createUser({
          uid: googleUser.uid,
          firstname: nameParts[0] || "",
          lastname: nameParts.slice(1).join(" "),
          email: googleUser.email || "",
          avatar: googleUser.photoURL || "",
          numberphone: googleUser.phoneNumber || "",
          role: "seller",
          status: "Новый",
          balance: "0",
          adres: "Адреса нет",
          createdAt: new Date().toISOString(),
        });
      }

      if (existingUser.role !== "seller") {
        alert("Этот аккаунт не является аккаунтом продавца");
        return;
      }

      localStorage.setItem("uid", googleUser.uid);

      alert("Вы успешно вошли через Google");

      checkStatus(existingUser);
    } catch (error) {
      console.error("Ошибка входа через Google:", error);
      alert("Не удалось войти через Google");
    }
  };

  useEffect(() => {
    allUser();
  }, []);

  useEffect(() => {
    const checkSavedUser = async () => {
      const uid = localStorage.getItem("uid");

      if (uid) {
        try {
          const user = await getUserByUid(uid);

          if (user && user.role === "seller") {
            checkStatus(user);
          }
        } catch (error) {
          console.error("Ошибка проверки пользователя:", error);
        }
      }
    };

    checkSavedUser();
  }, []);

  return (
    <div className="admin-signup-page">
      <div className="admin-signup-left">
        <div className="admin-signup-logo">
          MarketGo<span>.</span>
        </div>

        <div className="admin-signup-left-content">
          <p className="admin-signup-small">Продовец</p>

          <h1>
            Вход в
            <br />
            аккаунт
          </h1>

          <p className="admin-signup-left-text">
            Входите в аккаунт или <b>Зарегистрируйте свой бизнес</b>{" "}
            пользователя, чтобы продовать товары и оформлять заказы в одном
            месте.
          </p>
        </div>

        <div className="admin-signup-left-bottom">MarketGo — ВАШ МАГАЗИН</div>
      </div>

      <div className="admin-signup-right">
        <div className="admin-signup-form-container">
          <p className="admin-signup-form-small">ДОБРО ПОЖАЛОВАТЬ</p>

          <h2>Вход в аккаунт или Зарегистрируйте свой бизнес</h2>

          <p className="admin-signup-form-description">Через Google</p>

          <div className="admin-signup-form">
            <button className="admin-signup-button" onClick={loginWithGoogle}>
              <div className="google-logo" style={{ fontSize: "20px" }}>
                <span className="g-first">G</span>
                <span className="o-first">o</span>
                <span className="o-second">o</span>
                <span className="g-second">g</span>
                <span className="l-letter">l</span>
                <span className="e-letter">e</span>
              </div>
              <span>→</span>
            </button>
          </div>

          <p className="admin-signup-bottom-text">MarketGO</p>
        </div>
      </div>
    </div>
  );
}

export default Sellerignin;

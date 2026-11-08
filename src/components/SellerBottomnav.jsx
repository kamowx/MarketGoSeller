import { NavLink } from "react-router-dom";

function SellerBottomnav() {
  return (
    <nav className="seller-bottom-nav">
      <NavLink to="/sellerproducts" className="seller-bottom-link">
        <i className="fa-solid fa-house"></i>
        <span>Главная</span>
      </NavLink>

      <NavLink to="/sellerneworders" className="seller-bottom-link">
        <i className="fa-solid fa-receipt"></i>
        <span>Заказы</span>
      </NavLink>

      <NavLink to="/sellercourieraccepted" className="seller-bottom-link">
        <i className="fa-solid fa-truck"></i>
        <span>Курьеры</span>
      </NavLink>

      <NavLink to="/sellerprofile" className="seller-bottom-link">
        <i className="fa-solid fa-user"></i>
        <span>Профиль</span>
      </NavLink>
    </nav>
  );
}

export default SellerBottomnav;

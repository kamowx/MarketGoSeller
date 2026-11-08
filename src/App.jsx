import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import Sellersignin from "./screens/sellersignin";
import Sellerinfo from "./screens/sellerinfo";
import Sellerproducts from "./screens/sellerproducts";
import Sellercheck from "./screens/sellercheck";
import Sellerprofile from "./screens/sellerprofile";
import AddNewProducts from "./screens/addnewproducts";
import Sellerneworders from "./screens/sellerneworders";
import Sellerneworderdetails from "./screens/sellerneworderdetails";
import Sellerconfirmedorders from "./screens/sellerconfirmedorders";
import Sellerconfirmeddetails from "./screens/sellerconfirmeddetails";
import Sellercourierorders from "./screens/sellercourierorders";
import Sellercourierdetails from "./screens/sellercourierdetails";
import Sellercompletedorders from "./screens/sellercompletedorders";
import Sellercourieraccepted from "./screens/sellercourieraccepted";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Sellersignin />} />
        <Route path="/sellerinfo" element={<Sellerinfo />} />

        <Route path="/sellerproducts" element={<Sellerproducts />} />
        <Route path="/sellercheck" element={<Sellercheck />} />
        <Route path="/sellerprofile" element={<Sellerprofile />} />
        <Route path="/addnewproducts" element={<AddNewProducts />} />
        <Route path="/sellerneworders" element={<Sellerneworders />} />
        <Route path="/sellercourierorders" element={<Sellercourierorders />} />
        <Route
          path="/sellercourieraccepted"
          element={<Sellercourieraccepted />}
        />

        <Route
          path="/sellercompletedorders"
          element={<Sellercompletedorders />}
        />
        <Route
          path="/sellercourierdetails"
          element={<Sellercourierdetails />}
        />
        <Route
          path="/sellerconfirmeddetails"
          element={<Sellerconfirmeddetails />}
        />
        <Route
          path="/sellerconfirmedorders"
          element={<Sellerconfirmedorders />}
        />
        <Route
          path="/sellerneworderdetails/:id"
          element={<Sellerneworderdetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

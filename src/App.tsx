import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";

import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";

import SalesDashboard from "./pages/sales/SalesDashboard";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/supervisor"
          element={
            <SupervisorDashboard />
          }
        />

        <Route
          path="/sales"
          element={<SalesDashboard />}
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;
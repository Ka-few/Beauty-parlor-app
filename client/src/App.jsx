import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import Services from "./components/Services";
import Stylists from "./components/Stylists";
import Bookings from "./components/Bookings";
import BookingList from "./components/BookingList";
import ServiceList from "./components/ServiceList";

function App() {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // ✅ Keep token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // ✅ Fetch user details when token changes
  useEffect(() => {
    if (!token) return;

    const fetchMe = async () => {
      try {
        const res = await fetch("https://beauty-parlor-app-5.onrender.com/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCustomer(data.customer);
        } else {
          setCustomer(null);
          setToken(null);
        }
      } catch (err) {
        console.error(err);
        setCustomer(null);
        setToken(null);
      }
    };

    fetchMe();
  }, [token]);

  return (
    <Router>
      <Navbar customer={customer} setCustomer={setCustomer} setToken={setToken} />
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/services" />} />

        {/* Public routes */}
        <Route
          path="/register"
          element={<Register setCustomer={setCustomer} setToken={setToken} />}
        />
        <Route
          path="/login"
          element={<Login setCustomer={setCustomer} setToken={setToken} />}
        />

        {/* Services page: PUBLIC */}
        <Route path="/services" element={<Services token={token} />} />

        {/* Stylists page: PUBLIC */}
        <Route path="/stylists" element={<Stylists token={token} />} />

        {/* Admin-only service management */}
        <Route
          path="/manage-services"
          element={
            customer?.is_admin ? (
              <ServiceList token={token} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Customer bookings (protected) */}
        <Route
          path="/bookings"
          element={
            customer ? (
              <Bookings token={token} customer={customer} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/my-bookings"
          element={
            customer ? (
              <BookingList token={token} customer={customer} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

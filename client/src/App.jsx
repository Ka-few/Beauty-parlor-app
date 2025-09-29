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
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Auto-load logged-in customer with token
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

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
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  return (
    <Router>
      <Navbar customer={customer} setCustomer={setCustomer} />
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
        <Route path="/services" element={<Services user={customer} token={token} />} />

        {/* Stylists page: only visible to admin in Navbar */}
        <Route path="/stylists" element={<Stylists token={token} />} />

        {/* Admin-only service management */}
        <Route
          path="/manage-services"
          element={
            loading ? (
              <p>Loading...</p>
            ) : customer?.is_admin ? (
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
            loading ? (
              <p>Loading...</p>
            ) : customer ? (
              <Bookings token={token} customer={customer} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/my-bookings"
          element={
            loading ? (
              <p>Loading...</p>
            ) : customer ? (
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

import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import Services from "./components/Services";
import Stylists from "./components/Stylists";
import Bookings from "./components/Bookings";
import BookingList from "./components/BookingList";
import ServiceList from "./components/ServiceList";
// import StylistList from "./components/StylistList"; // Admin-only CRUD

function App() {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);

  // Auto-load logged-in customer with token
  useEffect(() => {
    if (!token) return;

    const fetchMe = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCustomer(data.customer);
        } else {
          setCustomer(null);
        }
      } catch (err) {
        console.error(err);
        setCustomer(null);
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

        {/* Services: different for customer vs admin */}
        <Route
          path="/services"
          element={
            customer ? (
              customer.is_admin ? (
                <ServiceList token={token} />
              ) : (
                <Services token={token} />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Stylists: public list for all customers */}
        <Route
          path="/stylists"
          element={customer ? <Stylists token={token} /> : <Navigate to="/login" />}
        />

        {/* Admin-only stylist management */}
        {/* <Route
          path="/manage-stylists"
          element={
            customer?.is_admin ? (
              <StylistList token={token} />
            ) : (
              <Navigate to="/login" />
            )
          }
        /> */}

        {/* Admin-only service management (direct link from navbar) */}
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

        {/* Customer bookings */}
        <Route
          path="/bookings"
          element={
            customer ? <Bookings token={token} customer={customer} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/my-bookings"
          element={
            customer ? (
              <BookingList token={token} customer={customer} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

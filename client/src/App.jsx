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
import ReviewForm from "./components/ReviewForm";
import ServiceList from "./components/ServiceList";

// Admin Imports
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users"; // Renamed to avoid conflict with client/src/components/Users
import AdminBookings from "./pages/admin/Bookings"; // Renamed to avoid conflict with client/src/components/Bookings
import AdminStylists from "./pages/admin/Stylists";

// Payment Imports
import PaymentPage from "./pages/PaymentPage"; // Import PaymentPage


function App() {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token")); // Changed from "token" to "access_token"
  const [loading, setLoading] = useState(true);

  // Auto-load logged-in customer with token
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchMe = async () => {
      try {
        // Use VITE_API_URL from .env
        const API_URL = import.meta.env.VITE_API_URL || 'https://beauty-parlor-app-5.onrender.com';
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCustomer(data.customer);
          // Store the entire customer object in localStorage
          localStorage.setItem("customer", JSON.stringify(data.customer));
        } else {
          setCustomer(null);
          setToken(null);
          localStorage.removeItem("access_token"); // Changed from "token" to "access_token"
          localStorage.removeItem("customer");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setCustomer(null);
        setToken(null);
        localStorage.removeItem("access_token"); // Changed from "token" to "access_token"
        localStorage.removeItem("customer");
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

        {/* Stylists page */}
        <Route path="/stylists" element={<Stylists token={token} />} />

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

        {/* Payment Route (protected) */}
        <Route
          path="/payment/:bookingId"
          element={
            loading ? (
              <p>Loading...</p>
            ) : customer ? (
              <PaymentPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Review Form Route (protected) */}
        <Route
          path="/submit-review"
          element={
            loading ? (
              <p>Loading...</p>
            ) : customer ? (
              <ReviewForm token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="stylists" element={<AdminStylists token={token} />} />
          <Route path="services" element={<ServiceList token={token} />} />
          {/* Add other admin routes here, e.g., service management */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

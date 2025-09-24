import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ customer, setCustomer, setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("customer");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="links">
        {!customer && (
          <>
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}

        {customer && customer.is_admin && (
          <>
            <Link to="/manage-services">Manage Services</Link>
            <Link to="/stylists">Manage Stylists</Link>
          </>
        )}

        {customer && !customer.is_admin && (
          <>
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/my-bookings">My Appointments</Link>
          </>
        )}
      </div>

      <div className="right">
        {customer && (
          <>
            <span className="welcome">Hi, {customer.name}</span>
            <button className="logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

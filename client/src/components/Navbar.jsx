import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ customer, setCustomer }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCustomer(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h1 className="logo">💇 Beauty Parlor</h1>

      <ul className="nav-links">
        {!customer && (
          <>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </>
        )}

        {customer && (
          <>
            <li>
              <Link to="/services">Services</Link>
            </li>
            <li>
              <Link to="/stylists">Stylists</Link>
            </li>
            <li>
              <Link to="/bookings">Book Now</Link>
            </li>
            <li>
              <Link to="/my-bookings">My Bookings</Link>
            </li>

            {customer.is_admin && (
              <li>
                <Link to="/manage-services">Manage Services</Link>
              </li>
            )}

            <li className="welcome">Welcome, {customer.name} 👋</li>
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

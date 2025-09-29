import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ customer, setCustomer }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCustomer(null);
    navigate("/services");
  };

  return (
    <nav className="navbar">
      <h1 className="logo">Beauty Parlour</h1>

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

            {/* Admin-only links */}
            {customer.is_admin ? (
              <>
                <li>
                  <Link to="/stylists">Stylists</Link>
                </li>
                <li>
                  <Link to="/manage-services">Manage Services</Link>
                </li>
              </>
            ) : (
              // Normal customer-only link
              <li>
                <Link to="/my-bookings">My Bookings</Link>
              </li>
            )}

            <li className="welcome">
              Welcome, {customer.name}{" "}
              {customer.is_admin && <span className="admin-badge">👑</span>}
            </li>

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

import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ customer, setCustomer, setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem("token"); // clear saved token
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <div className="flex space-x-4">
        {/* Always visible */}
        <Link to="/services" className="hover:underline">
          Services
        </Link>

        {/* Visible to everyone, but admin has extra management access */}
        <Link to="/stylists" className="hover:underline">
          Stylists
        </Link>

        {/* Customer-only link */}
        {customer && !customer.is_admin && (
          <Link to="/my-bookings" className="hover:underline">
            My Bookings
          </Link>
        )}

        {/* Admin-only links */}
        {customer?.is_admin && (
          <>
            <Link to="/manage-services" className="hover:underline">
              Manage Services
            </Link>
            <Link to="/manage-stylists" className="hover:underline">
              Manage Stylists
            </Link>
          </>
        )}
      </div>

      <div className="flex space-x-4">
        {customer ? (
          <>
            <span>Welcome, {customer.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

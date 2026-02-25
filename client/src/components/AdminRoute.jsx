import { Navigate } from "react-router-dom";

export default function AdminRoute({ children, customer, loading }) {
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!customer) {
    return <Navigate to="/login" replace />;
  }

  if (!customer.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

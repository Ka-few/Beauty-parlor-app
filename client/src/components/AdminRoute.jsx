import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const customerStr = localStorage.getItem("customer");

  if (!customerStr) {
    return <Navigate to="/login" />;
  }

  try {
    const customer = JSON.parse(customerStr);
    if (customer && customer.is_admin) {
      return children;
    }
  } catch (error) {
    console.error("Failed to parse customer from localStorage", error);
    // If parsing fails, treat as not logged in
    return <Navigate to="/login" />;
  }

  // If not an admin, redirect to the home page
  return <Navigate to="/" />;
}

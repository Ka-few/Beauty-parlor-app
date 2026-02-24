import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import './Services.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://beauty-parlor-app-5.onrender.com';

export default function Services({ user: propUser, token: propToken }) {
  const navigate = useNavigate();

  // Restore user + token from localStorage if not passed as props
  const [token, setToken] = useState(() => propToken || localStorage.getItem("access_token"));
  const [user, setUser] = useState(() => {
    if (propUser) return propUser;
    const saved = localStorage.getItem("customer");
    return saved ? JSON.parse(saved) : null;
  });

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAuthToast, setShowAuthToast] = useState(false);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/services`);
        if (!res.ok) throw new Error("Failed to fetch services");
        const data = await res.json();
        setServices(data);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Could not load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (!user) {
      setShowAuthToast(true);
    }
  }, [user]);

  // Handle booking
  const handleBooking = (serviceId) => {
    if (!user) {
      // Not logged in - redirect to login
      navigate("/login");
    } else if (!user.is_admin) {
      // Already logged in - go directly to booking with service pre-selected
      navigate(`/bookings?serviceId=${serviceId}`);
    }
  };

  // Admin formik form
  const formik = useFormik({
    initialValues: { title: "", description: "", price: "", image_url: "" },
    validationSchema: Yup.object({
      title: Yup.string().required("Required"),
      description: Yup.string().required("Required"),
      price: Yup.number().positive().required("Required"),
      image_url: Yup.string().url("Must be a valid URL").nullable(),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await fetch(`${API_URL}/services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("Failed to add service");

        resetForm();
        const updated = await fetch(`${API_URL}/services`);
        setServices(await updated.json());
      } catch (err) {
        console.error("Error adding service:", err);
      }
    },
  });

  if (loading) return <p>Loading services...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="services-container">
      {showAuthToast && !user && (
        <div className="auth-toast" role="status" aria-live="polite">
          <div className="auth-toast-content">
            <span>To book a service, please log in or create an account.</span>
            <div className="auth-toast-actions">
              <button type="button" onClick={() => navigate("/login")} className="auth-toast-link">
                Login
              </button>
              <button type="button" onClick={() => navigate("/register")} className="auth-toast-link">
                Register
              </button>
            </div>
          </div>
          <button
            type="button"
            className="auth-toast-close"
            onClick={() => setShowAuthToast(false)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      <h2>Our Services</h2>
     
      {/* Services list */}
      {services.length === 0 ? (
        <p className="no-services">No services available</p>
      ) : (
        <div className="service-list">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              {service.image_url && (
                <img src={service.image_url} alt={service.title} className="service-image" />
              )}
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <p className="service-price">Ksh {service.price}</p>

              {user && !user?.is_admin && (
                <button
                  onClick={() => handleBooking(service.id)}
                  className="book-btn"
                >
                  Book Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

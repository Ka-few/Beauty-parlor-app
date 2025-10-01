import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import './Services.css';

export default function Services({ user: propUser, token: propToken }) {
  const navigate = useNavigate();

  // Restore user + token from localStorage if not passed as props
  const [token, setToken] = useState(() => propToken || localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    if (propUser) return propUser;
    const saved = localStorage.getItem("customer");
    return saved ? JSON.parse(saved) : null;
  });

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("https://beauty-parlor-app-5.onrender.com/services");
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

  // Handle booking
  const handleBooking = (serviceId) => {
    if (!user) {
      navigate("/login"); // guest → login
    } else if (!user.is_admin) {
      navigate(`/bookings?serviceId=${serviceId}`); // customer → bookings
    }
  };

  // Admin formik form
  const formik = useFormik({
    initialValues: { name: "", description: "", price: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      description: Yup.string().required("Required"),
      price: Yup.number().positive().required("Required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await fetch("https://beauty-parlor-app-5.onrender.com/services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("Failed to add service");

        resetForm();
        const updated = await fetch("https://beauty-parlor-app-5.onrender.com/services");
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
      <h2>Our Services</h2>

      {/* Admin-only add service form */}
      {user?.is_admin && (
        <form onSubmit={formik.handleSubmit} className="add-service-form">
          <h3>Add New Service</h3>

          <input
            type="text"
            name="name"
            placeholder="Service Name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="error">{formik.errors.name}</p>
          )}

          <textarea
            name="description"
            placeholder="Service Description"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.description}
          />
          {formik.touched.description && formik.errors.description && (
            <p className="error">{formik.errors.description}</p>
          )}

          <input
            type="number"
            name="price"
            placeholder="Price (Ksh)"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.price}
          />
          {formik.touched.price && formik.errors.price && (
            <p className="error">{formik.errors.price}</p>
          )}

          <button type="submit" className="btn">
            Add Service
          </button>
        </form>
      )}

      {/* Services list */}
      {services.length === 0 ? (
        <p className="no-services">No services available</p>
      ) : (
        <div className="service-list">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <p className="service-price">Ksh {service.price}</p>

              {!user?.is_admin && (
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

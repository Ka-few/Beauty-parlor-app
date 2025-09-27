import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import "./Services.css";

export default function Services({ token }) {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("https://beauty-parlor-app-5.onrender.com/services", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setServices(data);
        } else {
          console.error("Failed to fetch services:", res.status);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchServices();
  }, [token]);

  return (
    <div className="services">
      <h2>Our Services</h2>
      {services.length === 0 ? (
        <p>Loading services...</p>
      ) : (
        <ul className="service-list">
          {services.map((service) => (
            <li key={service.id} className="service-card">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <p className="price">Price: Kshs {service.price}</p>

              <Formik
                initialValues={{ stylistId: "" }}
                validationSchema={Yup.object({
                  stylistId: Yup.string().required("Please select a stylist"),
                })}
                onSubmit={(values) => {
                  navigate(
                    `/bookings?serviceId=${service.id}&stylistId=${values.stylistId}`
                  );
                }}
              >
                {() => (
                  <Form>
                    {service.stylists && service.stylists.length > 0 ? (
                      <div>
                        <Field as="select" name="stylistId">
                          <option value="">Select a stylist</option>
                          {service.stylists.map((stylist) => (
                            <option key={stylist.id} value={stylist.id}>
                              {stylist.name}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="stylistId"
                          component="div"
                          className="error"
                        />
                      </div>
                    ) : (
                      <p>No stylists available</p>
                    )}

                    <button type="submit" className="book-btn">
                      Book
                    </button>
                  </Form>
                )}
              </Formik>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

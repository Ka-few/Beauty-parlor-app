import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import "./Bookings.css";

export default function Bookings({ token: propToken, customer: propCustomer }) {
  const navigate = useNavigate();

  // Restore token/customer from localStorage if not passed as props
  const [token, setToken] = useState(() => propToken || localStorage.getItem("token"));
  const [customer, setCustomer] = useState(() => {
    if (propCustomer) return propCustomer;
    const saved = localStorage.getItem("customer");
    return saved ? JSON.parse(saved) : null;
  });

  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!token || !customer) {
      navigate("/login");
    }
  }, [token, customer, navigate]);

  // Fetch services and stylists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const serviceRes = await fetch(
          "https://beauty-parlor-app-5.onrender.com/services",
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const stylistRes = await fetch(
          "https://beauty-parlor-app-5.onrender.com/stylists",
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        if (serviceRes.ok) {
          setServices(await serviceRes.json());
        }
        if (stylistRes.ok) {
          setStylists(await stylistRes.json());
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  if (loading) {
    return <p>Loading booking details...</p>;
  }

  return (
    <div className="booking-container">
      <div className="booking-form-wrapper">
        <h2>Confirm Your Booking</h2>

        <Formik
          initialValues={{ service: "", stylist: "", appointmentTime: "" }}
          validationSchema={Yup.object({
            service: Yup.string().required("Please select a service"),
            stylist: Yup.string().required("Please select a stylist"),
            appointmentTime: Yup.string().required("Please select a date and time"),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            if (!customer || !token) {
              navigate("/login");
              return;
            }

            try {
              const res = await fetch(
                "https://beauty-parlor-app-5.onrender.com/bookings",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    service_id: Number(values.service),
                    stylist_id: Number(values.stylist),
                    appointment_time: values.appointmentTime,
                  }),
                }
              );

              if (res.ok) {
                Swal.fire({
                  title: "Booking Confirmed!",
                  text: "Your appointment has been booked successfully.",
                  icon: "success",
                  confirmButtonText: "View My Bookings",
                }).then(() => {
                  navigate("/my-bookings");
                });
              } else {
                const error = await res.json();
                Swal.fire({
                  title: "Booking Failed",
                  text: error.error || "Something went wrong.",
                  icon: "error",
                  confirmButtonText: "Try Again",
                });
              }
            } catch (err) {
              console.error(err);
              Swal.fire({
                title: "Error",
                text: "An error occurred while booking. Please try again.",
                icon: "error",
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, isSubmitting }) => {
            // Filter stylists by selected service
            const filteredStylists = stylists.filter((stylist) =>
              stylist.services.some(
                (service) => service.id === Number(values.service)
              )
            );

            return (
              <Form className="booking-form">
                {/* Service dropdown */}
                <div>
                  <label>Service:</label>
                  <Field as="select" name="service" className="border rounded p-2 w-full mb-2">
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.title} – Ksh {service.price}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="service" component="div" className="error" />
                </div>

                {/* Stylist dropdown */}
                <div>
                  <label>Stylist:</label>
                  <Field as="select" name="stylist" className="border rounded p-2 w-full mb-2">
                    <option value="">Select Stylist</option>
                    {filteredStylists.map((stylist) => (
                      <option key={stylist.id} value={stylist.id}>
                        {stylist.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="stylist" component="div" className="error" />
                </div>

                {/* Appointment date */}
                <div>
                  <label>Appointment Date:</label>
                  <Field type="datetime-local" name="appointmentTime" />
                  <ErrorMessage
                    name="appointmentTime"
                    component="div"
                    className="error"
                  />
                </div>

                <button className="book-btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Booking..." : "Book"}
                </button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

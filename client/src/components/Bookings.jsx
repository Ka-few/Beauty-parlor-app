import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export default function Bookings({ token, customer }) {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const serviceId = queryParams.get("serviceId");
  const stylistId = queryParams.get("stylistId");

  const [service, setService] = useState(null);
  const [stylist, setStylist] = useState(null);

  // Fetch service & stylist details
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (serviceId) {
          const res = await fetch(
            `https://beauty-parlor-app-5.onrender.com/services/${serviceId}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
          if (res.ok) {
            const data = await res.json();
            setService(data);
          }
        }
        if (stylistId) {
          const res = await fetch(
            `https://beauty-parlor-app-5.onrender.com/stylists/${stylistId}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
          if (res.ok) {
            const data = await res.json();
            setStylist(data);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [serviceId, stylistId, token]);

  if (!service || !stylist) {
    return <p>Loading booking details...</p>;
  }

  return (
    <div className="booking-container">
      <div className="booking-form-wrapper">
        <h2>Confirm Your Booking</h2>

        <Formik
          initialValues={{ appointmentTime: "" }}
          validationSchema={Yup.object({
            appointmentTime: Yup.string().required("Please select a date and time"),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const res = await fetch(
                "https://beauty-parlor-app-5.onrender.com/appointments",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    customer_id: customer.id,
                    service_id: service.id,
                    stylist_id: stylist.id,
                    appointment_time: values.appointmentTime,
                  }),
                }
              );

              if (res.ok) {
                alert("Booking successful!");
                navigate("/my-bookings");
              } else {
                const error = await res.json();
                alert(error.error || "Booking failed");
              }
            } catch (err) {
              console.error(err);
              alert("An error occurred while booking.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="booking-form">
              <div>
                <label>Service:</label>
                <input type="text" value={service.title} readOnly />
              </div>

              <div>
                <label>Stylist:</label>
                <input type="text" value={stylist.name} readOnly />
              </div>

              <div>
                <label>Appointment Date:</label>
                <Field type="datetime-local" name="appointmentTime" />
                <ErrorMessage name="appointmentTime" component="div" className="error" />
              </div>

              <button type="submit" className="book-btn" disabled={isSubmitting}>
                {isSubmitting ? "Booking..." : "Book"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

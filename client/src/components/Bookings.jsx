import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import "./Bookings.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export default function Bookings({ token: propToken, customer: propCustomer }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedServiceId = searchParams.get("serviceId");

  // Restore token/customer from localStorage if not passed as props
  const [token, setToken] = useState(() => propToken || localStorage.getItem("access_token"));
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
          `${API_URL}/services`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const stylistRes = await fetch(
          `${API_URL}/stylists`,
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

  // Get stylists for a specific service
  const getStylistsForService = (serviceId) => {
    return stylists.filter(stylist =>
      stylist.services && stylist.services.some(s => s.id === Number(serviceId))
    );
  };

  return (
    <div className="booking-container">
      <div className="booking-form-wrapper">
        <h2>Create Your Booking</h2>

        <Formik
          initialValues={{
            serviceSelections: preSelectedServiceId
              ? [{ service_id: preSelectedServiceId, stylist_id: "" }]
              : [{ service_id: "", stylist_id: "" }],
            appointmentTime: "",
          }}
          validationSchema={Yup.object({
            serviceSelections: Yup.array().of(
              Yup.object({
                service_id: Yup.string().required("Please select a service"),
                stylist_id: Yup.string().required("Please select a stylist"),
              })
            ),
            appointmentTime: Yup.string().required("Please select a date and time"),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            if (!customer || !token) {
              navigate("/login");
              return;
            }

            try {
              const bookings = [];
              let totalPrice = 0;
              const failedBookings = [];

              // Create bookings for each service/stylist pair
              for (const selection of values.serviceSelections) {
                const res = await fetch(
                  `${API_URL}/bookings`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      service_id: Number(selection.service_id),
                      stylist_id: Number(selection.stylist_id),
                      appointment_time: values.appointmentTime,
                    }),
                  }
                );

                if (res.ok) {
                  const bookingResult = await res.json();
                  bookings.push(bookingResult.booking);
                  const bookedService = services.find(s => s.id === Number(selection.service_id));
                  totalPrice += bookedService?.price || 0;
                } else {
                  const error = await res.json();
                  failedBookings.push({
                    service: services.find(s => s.id === Number(selection.service_id))?.title,
                    error: error.error || "Unknown error",
                  });
                }
              }

              if (failedBookings.length > 0) {
                Swal.fire({
                  title: "Some Bookings Failed",
                  html: `<div style="text-align: left;">${failedBookings
                    .map(
                      (b) =>
                        `<p><strong>${b.service}:</strong> ${b.error}</p>`
                    )
                    .join("")}</div>`,
                  icon: "warning",
                  confirmButtonText: "Continue",
                });
              }

              if (bookings.length > 0) {
                Swal.fire({
                  title: "Bookings Confirmed!",
                  text: `${bookings.length} appointment(s) have been booked successfully. Please proceed to payment.`,
                  icon: "success",
                  confirmButtonText: "Proceed to Payment",
                }).then(() => {
                  // Redirect to payment with first booking ID and total price
                  navigate(`/payment/${bookings[0].id}`, {
                    state: {
                      amount: totalPrice,
                      bookings: bookings,
                    },
                  });
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
          {({ values, isSubmitting, errors, touched }) => (
            <Form className="booking-form">
              <FieldArray name="serviceSelections">
                {(arrayHelpers) => (
                  <div>
                    <div className="service-selections">
                      {values.serviceSelections.map((selection, index) => {
                        const availableStylists = getStylistsForService(selection.service_id);
                        return (
                          <div key={index} className="service-pair">
                            <div className="pair-row">
                              <div className="form-group">
                                <label htmlFor={`serviceSelections.${index}.service_id`}>
                                  <strong>Service {index + 1}:</strong>
                                </label>
                                <Field
                                  as="select"
                                  name={`serviceSelections.${index}.service_id`}
                                  className="form-control"
                                >
                                  <option value="">Select a service</option>
                                  {services.map((service) => (
                                    <option key={service.id} value={service.id}>
                                      {service.title} – Ksh {service.price}
                                    </option>
                                  ))}
                                </Field>
                                <ErrorMessage
                                  name={`serviceSelections.${index}.service_id`}
                                  component="div"
                                  className="error"
                                />
                              </div>

                              <div className="form-group">
                                <label htmlFor={`serviceSelections.${index}.stylist_id`}>
                                  <strong>Stylist {index + 1}:</strong>
                                </label>
                                <Field
                                  as="select"
                                  name={`serviceSelections.${index}.stylist_id`}
                                  className="form-control"
                                  disabled={!selection.service_id}
                                >
                                  <option value="">
                                    {!selection.service_id
                                      ? "Select a service first"
                                      : availableStylists.length === 0
                                      ? "No stylists available"
                                      : "Select a stylist"}
                                  </option>
                                  {availableStylists.map((stylist) => (
                                    <option key={stylist.id} value={stylist.id}>
                                      {stylist.name}
                                    </option>
                                  ))}
                                </Field>
                                <ErrorMessage
                                  name={`serviceSelections.${index}.stylist_id`}
                                  component="div"
                                  className="error"
                                />
                              </div>
                            </div>

                            {values.serviceSelections.length > 1 && (
                              <button
                                type="button"
                                className="remove-btn"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="add-service-btn"
                      onClick={() =>
                        arrayHelpers.push({ service_id: "", stylist_id: "" })
                      }
                    >
                      + Add Another Service
                    </button>
                  </div>
                )}
              </FieldArray>

              {/* Appointment date */}
              <div className="form-group">
                <label htmlFor="appointmentTime">
                  <strong>Appointment Date & Time:</strong>
                </label>
                <Field
                  type="datetime-local"
                  name="appointmentTime"
                  className="form-control"
                />
                <ErrorMessage
                  name="appointmentTime"
                  component="div"
                  className="error"
                />
              </div>

              <button
                className="book-btn"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Booking..." : "Book Now"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

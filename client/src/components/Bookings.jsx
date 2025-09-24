import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Bookings.css";


export default function Bookings({ token, customer }) {
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedStylist, setSelectedStylist] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Get serviceId from query string if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serviceId = params.get("serviceId");
    if (serviceId) setSelectedService(serviceId);
  }, [location.search]);

  // Fetch all services
  useEffect(() => {
    if (!token) return;

    const fetchServices = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/services", {
          headers: { Authorization: `Bearer ${token}` },
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
    fetchServices();
  }, [token]);

  // Fetch stylists for the selected service
  useEffect(() => {
    if (!selectedService || !token) return;

    const fetchStylists = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/services/${selectedService}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setStylists(data.stylists || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStylists();
  }, [selectedService, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customer) {
      alert("You must be logged in to book a service.");
      return;
    }

    if (!selectedService || !selectedStylist || !appointmentTime) {
      alert("Please select a service, stylist, and date.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_id: customer.id,
          service_id: Number(selectedService),
          stylist_id: Number(selectedStylist),
          appointment_time: appointmentTime,
        }),
      });

      if (res.ok) {
        alert("Booking created successfully!");
        navigate("/my-bookings");
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || "Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error, try again.");
    }
  };

  return (
  <div className="booking-container">
    <div className="booking-form-wrapper">
      <h2>Book a Service</h2>
      <form className="booking-form" onSubmit={handleSubmit}>
        <div>
          <label>Service:</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="">--Select Service--</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Stylist:</label>
          <select
            value={selectedStylist}
            onChange={(e) => setSelectedStylist(e.target.value)}
          >
            <option value="">--Select Stylist--</option>
            {stylists.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Appointment Date:</label>
          <input
            type="datetime-local"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
          />
        </div>

        <button className="book-btn" type="submit">Book</button>
      </form>
    </div>
  </div>
);
}
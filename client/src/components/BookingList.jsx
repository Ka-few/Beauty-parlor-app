import { useState, useEffect } from "react";
import "./BookingList.css";

export default function BookingList({ token, customer }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!token || !customer) return;

    const fetchBookings = async () => {
      try {
        const res = await fetch(
          `https://beauty-parlor-app-5.onrender.com/bookings?customer_id=${customer.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchBookings();
  }, [token, customer]);

  return (
    <div className="booking-list-container">
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="no-bookings">No bookings yet.</p>
      ) : (
        <ul className="booking-list">
          {bookings.map((b) => (
            <li key={b.id} className="booking-card">
              <p>
                <strong>Service:</strong> {b.service?.title || "No service"}
              </p>
              <p>
                <strong>Stylist:</strong> {b.stylist.name}
              </p>
              <p className="booking-date">
                <strong>Date:</strong>{" "}
                {new Date(b.appointment_time).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

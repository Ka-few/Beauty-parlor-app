import { useState, useEffect } from "react";

export default function BookingList({ token, customer }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!token || !customer) return;

    const fetchBookings = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/bookings?customer_id=${customer.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    <div>
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <ul>
          {bookings.map((b) => (
            <li key={b.id}>
              <strong>Service:</strong> {b.service?.title || "No service"} <br />
              <strong>Stylist:</strong> {b.stylist.name} <br />
              <strong>Date:</strong> {new Date(b.appointment_time).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

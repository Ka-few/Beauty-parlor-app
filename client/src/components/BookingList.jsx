import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./BookingList.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export default function BookingList({ token, customer }) {
  const [bookings, setBookings] = useState([]);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editAppointmentTime, setEditAppointmentTime] = useState("");

  const fetchBookings = async () => {
    if (!token || !customer) return;

    try {
      const res = await fetch(
        `${API_URL}/bookings?customer_id=${customer.id}`,
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

  const toDateTimeLocal = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  useEffect(() => {
    fetchBookings();
  }, [token, customer]);

  const startEdit = (booking) => {
    setEditingBookingId(booking.id);
    setEditAppointmentTime(toDateTimeLocal(booking.appointment_time));
  };

  const cancelEdit = () => {
    setEditingBookingId(null);
    setEditAppointmentTime("");
  };

  const handleUpdate = async (bookingId) => {
    if (!editAppointmentTime) {
      Swal.fire({
        title: "Missing Date/Time",
        text: "Please select a new appointment date and time.",
        icon: "warning",
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appointment_time: editAppointmentTime }),
      });

      const data = await res.json();
      if (!res.ok) {
        Swal.fire({
          title: "Update Failed",
          text: data.error || "Could not update booking.",
          icon: "error",
        });
        return;
      }

      Swal.fire({
        title: "Booking Updated",
        text: "Your booking was updated successfully.",
        icon: "success",
      });

      cancelEdit();
      fetchBookings();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "An error occurred while updating booking.",
        icon: "error",
      });
    }
  };

  const handleDelete = async (bookingId) => {
    const confirmation = await Swal.fire({
      title: "Delete booking?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        Swal.fire({
          title: "Delete Failed",
          text: data.error || "Could not delete booking.",
          icon: "error",
        });
        return;
      }

      Swal.fire({
        title: "Deleted",
        text: "Booking deleted successfully.",
        icon: "success",
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "An error occurred while deleting booking.",
        icon: "error",
      });
    }
  };

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
              {editingBookingId === b.id ? (
                <div className="booking-actions">
                  <input
                    type="datetime-local"
                    className="booking-edit-input"
                    value={editAppointmentTime}
                    onChange={(e) => setEditAppointmentTime(e.target.value)}
                  />
                  <button
                    className="booking-action-btn"
                    onClick={() => handleUpdate(b.id)}
                  >
                    Save
                  </button>
                  <button
                    className="booking-action-btn secondary"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="booking-actions">
                  <button
                    className="booking-action-btn"
                    onClick={() => startEdit(b)}
                  >
                    Edit
                  </button>
                  <button
                    className="booking-action-btn danger"
                    onClick={() => handleDelete(b.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

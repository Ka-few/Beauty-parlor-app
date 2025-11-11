import { useEffect, useState } from 'react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://beauty-parlor-app-5.onrender.com';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/admin/bookings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings.');
        }

        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="admin-page-header">All Bookings</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Stylist</th>
            <th>Service</th>
            <th>Price</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking.id}>
              <td>{booking.id}</td>
              <td>{booking.customer_name}</td>
              <td>{booking.stylist_name}</td>
              <td>{booking.service_name}</td>
              <td>Kshs {booking.service_price.toFixed(2)}</td>
              <td>{new Date(booking.appointment_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

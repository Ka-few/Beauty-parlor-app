import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './PaymentPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://beauty-parlor-app-5.onrender.com';

const CheckoutForm = ({ bookingId, amount, serviceTitle }) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem('customer'));
    if (customer && customer.phone) {
      setPhoneNumber(customer.phone);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/initiate-mpesa-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount), // M-Pesa requires an integer
          phone_number: phoneNumber,
          booking_id: bookingId,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to initiate M-Pesa payment');
      }

      setSucceeded(true);
    } catch (err) {
      console.error("Error initiating M-Pesa payment:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h2>Complete Your Payment</h2>
      {serviceTitle && <p>Service: {serviceTitle}</p>}
      {amount && <p>Amount: Ksh {amount}</p>}

      {error && <div className="payment-error">{error}</div>}
      {succeeded && (
        <div className="payment-success">
          <p>Payment initiated successfully!</p>
          <p>Please check your phone for a prompt to complete the payment.</p>
        </div>
      )}

      <div className="phone-number-container">
        <label htmlFor="phone-number">Phone Number</label>
        <input
          id="phone-number"
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g. 254712345678"
          required
        />
      </div>

      <button type="submit" disabled={loading || succeeded} className="pay-button">
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default function PaymentPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const amount = location.state?.amount;
  const serviceTitle = location.state?.serviceTitle;

  useEffect(() => {
    if (!amount || !bookingId) {
      // If amount or bookingId is missing, redirect to my-bookings or home
      navigate('/my-bookings', { replace: true });
    }
  }, [amount, bookingId, navigate]);

  if (!amount || !bookingId) {
    return null; // Or a loading spinner, or error message
  }

  return (
    <div className="payment-page-container">
      <CheckoutForm bookingId={bookingId} amount={amount} serviceTitle={serviceTitle} />
    </div>
  );
}


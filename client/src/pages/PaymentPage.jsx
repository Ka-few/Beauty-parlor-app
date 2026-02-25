import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './PaymentPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://beauty-parlor-app-5.onrender.com';
const PAYMENT_POLL_INTERVAL_MS = 3000;
const PAYMENT_POLL_MAX_ATTEMPTS = 12;

const CheckoutForm = ({ bookingId, amount, serviceTitle }) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      const result = await response.json();
      if (!response.ok) {
        const details =
          typeof result?.details === 'string'
            ? result.details
            : result?.details?.errorMessage ||
              result?.details?.ResponseDescription ||
              result?.details?.raw;
        const detailsMessage =
          details ||
          (result?.status_code ? `M-Pesa status ${result.status_code}` : null);
        throw new Error(detailsMessage || result.error || 'Failed to initiate M-Pesa payment');
      }

      Swal.fire({
        title: 'Waiting for Payment Confirmation',
        text: 'Complete the M-Pesa prompt on your phone.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let paymentStatus = 'pending';
      for (let attempt = 0; attempt < PAYMENT_POLL_MAX_ATTEMPTS; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, PAYMENT_POLL_INTERVAL_MS));
        const statusResponse = await fetch(
          `${API_URL}/bookings/${bookingId}/payment-status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!statusResponse.ok) {
          continue;
        }

        const statusData = await statusResponse.json();
        paymentStatus = statusData?.payment_status || 'pending';

        if (paymentStatus === 'successful' || paymentStatus === 'incomplete') {
          break;
        }
      }

      Swal.close();

      if (paymentStatus === 'successful') {
        await Swal.fire({
          icon: 'success',
          title: 'Payment Successful',
          text: 'Your booking payment was completed successfully.',
          confirmButtonText: 'OK',
        });
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Payment Failed or Incomplete',
          text: 'Payment was not completed. Your booking remains pending/incomplete.',
          confirmButtonText: 'OK',
        });
      }

      navigate('/my-bookings');
    } catch (err) {
      console.error("Error initiating M-Pesa payment:", err);
      setError(err.message);
      await Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: err.message || 'Could not initiate payment.',
        confirmButtonText: 'OK',
      });
      navigate('/my-bookings');
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

      <button type="submit" disabled={loading} className="pay-button">
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

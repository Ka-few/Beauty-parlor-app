import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './StylistReviews.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://beauty-parlor-app-5.onrender.com';

export default function StylistReviews({ stylistId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/stylists/${stylistId}/reviews`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        } else {
          setError('Failed to fetch reviews.');
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('An error occurred while fetching reviews.');
      } finally {
        setLoading(false);
      }
    };

    if (stylistId) {
      fetchReviews();
    }
  }, [stylistId]);

  if (loading) {
    return <p>Loading reviews...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (reviews.length === 0) {
    return <p>No reviews yet for this stylist.</p>;
  }

  return (
    <div className="stylist-reviews-container">
      <h3>Customer Reviews</h3>
      <ul className="reviews-list">
        {reviews.map((review) => (
          <li key={review.id} className="review-item">
            <div className="review-header">
              <span className="review-rating">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </span>
              <span className="review-date">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="review-comment">{review.comment || 'No comment provided.'}</p>
            <p className="review-customer">
              - {review.customer_name || `Customer ${review.customer_id}`}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

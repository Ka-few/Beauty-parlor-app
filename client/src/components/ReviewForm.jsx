import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'https://beauty-parlor-app-5.onrender.com';

export default function ReviewForm({ token }) {
  const navigate = useNavigate();
  const [stylists, setStylists] = useState([]);
  const [selectedStylist, setSelectedStylist] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchStylists = async () => {
      try {
        const res = await fetch(`${API_URL}/stylists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStylists(data);
        } else {
          console.error('Failed to fetch stylists');
        }
      } catch (err) {
        console.error('Error fetching stylists:', err);
      }
    };

    fetchStylists();
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStylist || rating === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Please select a stylist and provide a rating.',
        icon: 'error',
        confirmButtonText: 'Ok',
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stylist_id: parseInt(selectedStylist),
          rating: rating,
          comment: comment,
        }),
      });

      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Review submitted successfully.',
          icon: 'success',
          confirmButtonText: 'Great!',
        });
        // Reset form
        setSelectedStylist('');
        setRating(0);
        setComment('');
      } else {
        const errorData = await res.json();
        Swal.fire({
          title: 'Error',
          text: errorData.error || 'Failed to submit review.',
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      Swal.fire({
        title: 'Error',
        text: 'An unexpected error occurred.',
        icon: 'error',
        confirmButtonText: 'Ok',
      });
    }
  };

  return (
    <div className="review-form-container">
      <h2>Submit a Review</h2>
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label htmlFor="stylist-select">Select Stylist:</label>
          <select
            id="stylist-select"
            value={selectedStylist}
            onChange={(e) => setSelectedStylist(e.target.value)}
            required
          >
            <option value="">-- Choose a Stylist --</option>
            {stylists.map((stylist) => (
              <option key={stylist.id} value={stylist.id}>
                {stylist.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Rating:</label>
          <div className="star-rating">
            {[...Array(5)].map((star, index) => {
              index += 1;
              return (
                <button
                  type="button"
                  key={index}
                  className={index <= (hover || rating) ? 'on' : 'off'}
                  onClick={() => setRating(index)}
                  onMouseEnter={() => setHover(index)}
                  onMouseLeave={() => setHover(rating)}
                >
                  <span className="star">&#9733;</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Comment (Optional):</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            placeholder="Share your experience..."
          ></textarea>
        </div>

        <button type="submit" className="submit-review-btn">
          Submit Review
        </button>
      </form>
    </div>
  );
}

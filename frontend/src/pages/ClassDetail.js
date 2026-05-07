import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classAPI, bookingAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePublicKey ="pk_test_51TU3W2DxzM5cyye88ROuKCgqGvpNgAwIGwoLUsS5VuUKUOOF436xBNCvJJBjO0EpclwIa9AxEG7edtlR3gtpBE3c00ilQ1m2Ns";
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

// Stripe Payment Form Component
const StripePaymentForm = ({ clientSecret, classId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [localError, setLocalError] = useState('');
  const [stripeProcessing, setStripeProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setLocalError('Stripe is still initializing. Please wait a moment.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setLocalError('Card input is not available.');
      return;
    }

    setStripeProcessing(true);
    setLocalError('');

    const { error: stripeErrorResult, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (stripeErrorResult) {
      setLocalError(stripeErrorResult.message || 'Payment failed. Please try again.');
      setStripeProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        await bookingAPI.confirmPayment({ paymentIntentId: paymentIntent.id, classId });
        onSuccess();
      } catch (err) {
        setLocalError(err.response?.data?.message || 'Payment succeeded but confirmation failed.');
        setStripeProcessing(false);
      }
    } else {
      setLocalError('Payment did not complete. Please try again.');
      setStripeProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.paymentForm}>
      <div style={styles.cardField}>
        <CardElement options={{ style: { base: { fontSize: '16px', color: '#1f2937', '::placeholder': { color: '#9ca3af' } }, invalid: { color: '#b91c1c' } } }} />
      </div>
      {localError && <div style={styles.errorMessage}>{localError}</div>}
      <button type="submit" disabled={stripeProcessing} style={styles.payButton}>
        {stripeProcessing ? '⏳ Processing payment...' : `Pay $${amount || 0}`}
      </button>
    </form>
  );
};

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [fitnessClass, setFitnessClass] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [alreadyBooked, setAlreadyBooked] = useState(false);

  // ✅ FIXED using useCallback
  const fetchClassDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const classResponse = await classAPI.getClassById(id);
      setFitnessClass(classResponse.data);

      if (classResponse.data.trainer?._id) {
        const reviewsResponse = await reviewAPI.getTrainerReviews(
          classResponse.data.trainer._id
        );
        setReviews(reviewsResponse.data);
      }

      if (user) {
        const bookingsResponse = await bookingAPI.getMyBookings();
        const hasBooking = bookingsResponse.data.some(
          booking => String(booking.class?._id) === String(classResponse.data._id) && booking.status !== 'cancelled'
        );
        setAlreadyBooked(hasBooking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch class details');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  // ✅ Correct dependency
  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);

  const handleBookingInit = async () => {
    try {
      setBookingLoading(true);
      const response = await bookingAPI.createBooking({ classId: id });
      setClientSecret(response.data.clientSecret);
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed';
      setError(msg);
      alert(msg);
      if (msg === 'You already have a booking for this class.') {
        setAlreadyBooked(true);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const getClassEndDate = (fitnessClass) => {
    if (!fitnessClass?.scheduleDate) return null;
    const endDate = new Date(fitnessClass.scheduleDate);
    if (fitnessClass.endTime) {
      const [hours, minutes] = fitnessClass.endTime.split(':');
      endDate.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0, 0, 0);
    } else if (fitnessClass.duration) {
      endDate.setMinutes(endDate.getMinutes() + Number(fitnessClass.duration));
    }
    return endDate;
  };

  const isClassCompleted = (fitnessClass) => {
    const endDate = getClassEndDate(fitnessClass);
    return endDate ? endDate <= new Date() : false;
  };

  const handleStripePaymentSuccess = async () => {
    setClientSecret('');
    alert('✅ Payment successful! Your booking is confirmed. Redirecting to My Bookings...');
    navigate('/my-bookings');
  };

  if (loading) return <div style={styles.container}>Loading...</div>;

  if (error)
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );

  if (!fitnessClass)
    return <div style={styles.container}>Class not found</div>;

  const spotsAvailable =
    fitnessClass.capacity - fitnessClass.enrolledUsers.length;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>← Back</button>
      <div style={styles.detailsCard}>
        <h1>{fitnessClass.title}</h1>

        {fitnessClass.imageUrl && (
          <img
            src={fitnessClass.imageUrl}
            alt={fitnessClass.title}
            style={styles.classImage}
          />
        )}

        <p style={styles.description}>{fitnessClass.description}</p>

        <div style={styles.info}>
          <div style={styles.infoRow}>
            <strong>Type:</strong> <span>{fitnessClass.type}</span>
          </div>

          <div style={styles.infoRow}>
            <strong>Trainer:</strong>
            <span>{fitnessClass.trainer?.name}</span>
          </div>

          <div style={styles.infoRow}>
            <strong>Date:</strong>
            <span>
              {new Date(fitnessClass.scheduleDate).toLocaleDateString()}
            </span>
          </div>

          <div style={styles.infoRow}>
            <strong>Time:</strong>
            <span>
              {fitnessClass.startTime} - {fitnessClass.endTime}
            </span>
          </div>

          <div style={styles.infoRow}>
            <strong>Duration:</strong>
            <span>{fitnessClass.duration} minutes</span>
          </div>

          <div style={styles.infoRow}>
            <strong>Price:</strong>
            <span style={styles.price}>${fitnessClass.price}</span>
          </div>

          <div style={styles.infoRow}>
            <strong>Available Spots:</strong>
            <span>{spotsAvailable}</span>
          </div>
        </div>

        {user?.role === 'user' && spotsAvailable > 0 && !clientSecret && !isClassCompleted(fitnessClass) && (
          <>
            {alreadyBooked ? (
              <div style={styles.alreadyBookedBanner}>
                ✅ You already have a booking for this class. Visit My Bookings to manage it.
              </div>
            ) : (
              <button
                onClick={handleBookingInit}
                disabled={bookingLoading}
                style={styles.bookButton}
              >
                {bookingLoading ? '⏳ Initializing booking...' : '💳 Book & Pay Now'}
              </button>
            )}
          </>
        )}
        {user?.role === 'user' && isClassCompleted(fitnessClass) && (
          <div style={styles.alreadyBookedBanner}>
            ⚠️ This class has already finished and cannot be booked.
          </div>
        )}

        {clientSecret && stripePromise && (
          <div style={styles.paymentSection}>
            <h3>Complete Payment</h3>
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>Enter your card details below to complete the booking with Stripe.</p>
            <p style={{ color: '#6c757d', fontSize: '0.82rem' }}>💡 Use Stripe test card: <strong>4242 4242 4242 4242</strong> | Exp: any future date | CVC: any 3 digits</p>
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                clientSecret={clientSecret}
                classId={id}
                amount={fitnessClass?.price}
                onSuccess={handleStripePaymentSuccess}
              />
            </Elements>
          </div>
        )}

        {clientSecret && !stripePromise && (
          <div style={styles.paymentSection}>
            <h3>Stripe payment is not configured</h3>
            <p style={{ color: '#b91c1c' }}>
              Please set <code>REACT_APP_STRIPE_PUBLIC_KEY</code> in the frontend <code>.env</code> file with your Stripe publishable key.
            </p>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div style={styles.reviewsSection}>
        <h2 style={styles.reviewsTitle}>⭐ Reviews from Clients</h2>

        <div style={styles.reviewsList}>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} style={styles.reviewItem}>
                <div style={styles.reviewHeader}>
                  <strong>{review.user?.name}</strong>
                  <span style={styles.rating}>
                    {'⭐'.repeat(review.rating)}
                  </span>
                </div>

                <p>{review.comment}</p>

                {review.trainerResponse && (
                  <div style={styles.trainerResponse}>
                    <strong>Trainer Response:</strong>
                    <p>{review.trainerResponse}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '2rem auto',
    padding: '0 2rem',
  },
  detailsCard: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '2rem',
  },
  classImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
    marginBottom: '1rem',
  },
  description: {
    color: '#666',
  },
  info: {
    display: 'grid',
    gap: '1rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  price: {
    color: 'green',
    fontWeight: 'bold',
  },
  bookButton: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'green',
    color: '#fff',
    border: 'none',
    width: '100%',
  },
  error: {
    color: 'red',
  },
  alreadyBookedBanner: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #6ee7b7',
    borderRadius: '8px',
    fontWeight: '600',
  },
  reviewsSection: {
    background: '#fff',
    padding: '2rem',
  },
  reviewsTitle: {
    fontSize: '1.5rem',
  },
  reviewButton: {
    margin: '1rem 0',
  },
  reviewForm: {
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  input: {
    padding: '0.5rem',
  },
  textarea: {
    padding: '0.5rem',
  },
  submitButton: {
    background: 'green',
    color: '#fff',
    padding: '0.5rem 1rem',
  },
  reviewsList: {},
  reviewItem: {
    marginBottom: '1rem',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  rating: {},
  trainerResponse: {
    background: '#eee',
    padding: '0.5rem',
  },
  paymentSection: {
    marginTop: '2rem',
    padding: '1.5rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  paymentForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
  },
  cardField: {
    padding: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#fff',
  },
  errorMessage: {
    color: '#b91c1c',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
  },
  payButton: {
    padding: '1rem',
    background: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  backButton: {
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    display: 'inline-block',
  },
};

export default ClassDetail;

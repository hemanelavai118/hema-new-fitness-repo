import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classAPI, bookingAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// DummyPaymentModal — shown when Stripe is not configured (demo/test mode)
const DummyPaymentModal = ({ bookingId, amount, className, onSuccess, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [card, setCard] = useState({ name: '', number: '4242 4242 4242 4242', expiry: '12/26', cvv: '123' });

  const handlePay = async (e) => {
    e.preventDefault();
    if (!card.name.trim()) {
      setError('Please enter the cardholder name.');
      return;
    }
    setError('');
    setProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 1500)); // simulate network delay
      await bookingAPI.confirmPayment({ paymentIntentId: 'dummy_success_id', bookingId });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div style={dModal.overlay} onClick={() => !processing && onClose()}>
      <div style={dModal.box} onClick={e => e.stopPropagation()}>
        <div style={dModal.header}>
          <h2 style={{ margin: 0, fontSize: '1.35rem' }}>💳 Complete Payment</h2>
          <button onClick={() => !processing && onClose()} style={dModal.closeBtn}>×</button>
        </div>
        <div style={dModal.body}>
          <div style={dModal.summary}>
            <div style={dModal.summaryRow}><span style={{ color: '#6c757d' }}>Class</span><strong>{className}</strong></div>
            <div style={{ ...dModal.summaryRow, marginTop: '0.5rem' }}>
              <span style={{ color: '#6c757d' }}>Amount</span>
              <strong style={{ fontSize: '1.3rem', color: '#10b981' }}>${amount}</strong>
            </div>
          </div>
          <div style={dModal.demoNote}>🔒 Demo Mode — Payments are simulated. Use the pre-filled test card.</div>
          <form onSubmit={handlePay}>
            <div style={dModal.field}>
              <label style={dModal.label}>Cardholder Name</label>
              <input value={card.name} onChange={e => setCard({...card, name: e.target.value})}
                placeholder="Your Full Name" required style={dModal.input} />
            </div>
            <div style={dModal.field}>
              <label style={dModal.label}>Card Number</label>
              <input value={card.number} onChange={e => setCard({...card, number: e.target.value})}
                style={{ ...dModal.input, letterSpacing: '2px', fontFamily: 'monospace' }} maxLength={19} />
              <small style={{ color: '#6c757d' }}>✓ Test card: 4242 4242 4242 4242</small>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={dModal.field}>
                <label style={dModal.label}>Expiry</label>
                <input value={card.expiry} onChange={e => setCard({...card, expiry: e.target.value})}
                  placeholder="MM/YY" style={dModal.input} />
              </div>
              <div style={dModal.field}>
                <label style={dModal.label}>CVV</label>
                <input value={card.cvv} onChange={e => setCard({...card, cvv: e.target.value})}
                  placeholder="123" style={dModal.input} maxLength={3} />
              </div>
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</div>}
            <button type="submit" disabled={processing} style={{
              ...dModal.payBtn,
              opacity: processing ? 0.7 : 1,
              cursor: processing ? 'not-allowed' : 'pointer',
            }}>
              {processing ? '⏳ Processing...' : `Pay $${amount} Now`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const dModal = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  box: { background: '#fff', borderRadius: '16px', maxWidth: '460px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6c757d', lineHeight: 1 },
  body: { padding: '1.5rem' },
  summary: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  demoNote: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.7rem 1rem', fontSize: '0.82rem', color: '#1d4ed8', marginBottom: '1.25rem', textAlign: 'center', fontWeight: '500' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' },
  label: { fontSize: '0.82rem', fontWeight: '600', color: '#495057' },
  input: { padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  payBtn: { width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', marginTop: '0.25rem' },
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
  const [pendingBookingId, setPendingBookingId] = useState(null);
  const [showDummyModal, setShowDummyModal] = useState(false);

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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch class details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ✅ Correct dependency
  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);

  const handleBookingInit = async () => {
    try {
      setBookingLoading(true);
      const response = await bookingAPI.createBooking({ classId: id });
      
      if (response.data.clientSecret === 'dummy_secret_mode') {
        // Show dummy payment modal instead of auto-confirming
        setPendingBookingId(response.data.booking._id);
        setShowDummyModal(true);
      } else {
        setClientSecret(response.data.clientSecret);
        setPendingBookingId(response.data.booking._id);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed';
      setError(msg);
      alert(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowDummyModal(false);
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

        {user && spotsAvailable > 0 && !clientSecret && !showDummyModal && (
          <button
            onClick={handleBookingInit}
            disabled={bookingLoading}
            style={styles.bookButton}
          >
            {bookingLoading ? '⏳ Initializing booking...' : '💳 Book & Pay Now'}
          </button>
        )}

        {clientSecret && (
          <div style={styles.paymentSection}>
            <h3>Complete Payment (Stripe)</h3>
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>Stripe payment form would appear here with a live key.</p>
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

      {/* Dummy Payment Modal */}
      {showDummyModal && (
        <DummyPaymentModal
          bookingId={pendingBookingId}
          amount={fitnessClass?.price || 0}
          className={fitnessClass?.title || 'Class'}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowDummyModal(false)}
        />
      )}
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
};

export default ClassDetail;
import React, { useState, useEffect } from 'react';
import { bookingAPI, reviewAPI } from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingBookingId, setReviewingBookingId] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [userReviews, setUserReviews] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [paymentModal, setPaymentModal] = useState(null); // { bookingId, amount, className }
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '4242 4242 4242 4242', expiry: '12/26', cvv: '123', name: '' });

  const getBookingEndDate = (booking) => {
    if (!booking?.class?.scheduleDate) return null;

    const endDate = new Date(booking.class.scheduleDate);
    if (booking.class.endTime) {
      const [hours, minutes] = booking.class.endTime.split(':');
      endDate.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0, 0, 0);
    } else if (booking.class.duration) {
      endDate.setMinutes(endDate.getMinutes() + Number(booking.class.duration));
    }
    return endDate;
  };

  const isBookingCompleted = (booking) => {
    const endDate = getBookingEndDate(booking);
    return endDate ? endDate <= new Date() : false;
  };

  useEffect(() => {
    fetchBookings();
    fetchUserReviews();
  }, []);


  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const response = await reviewAPI.getMyReviews();
      setUserReviews(response.data);
    } catch (err) {
      console.error('Failed to fetch user reviews', err);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancelBooking(bookingId);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleReviewSubmit = async (e, booking) => {
    e.preventDefault();
    try {
      await reviewAPI.addReview({
        trainerId: booking.trainer._id,
        classId: booking.class._id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      alert('✅ Feedback submitted successfully! Thank you for your review.');
      setReviewingBookingId(null);
      setReviewData({ rating: 5, comment: '' });
      fetchUserReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const openPaymentModal = (booking) => {
    setPaymentModal({
      bookingId: booking._id,
      classId: booking.class?._id,
      amount: booking.class?.price || 0,
      className: booking.class?.title || 'Class',
    });
    setCardDetails({ number: '4242 4242 4242 4242', expiry: '12/26', cvv: '123', name: '' });
  };

  const handleDummyPayment = async (e) => {
    e.preventDefault();
    if (!cardDetails.name.trim()) {
      alert('Please enter the cardholder name.');
      return;
    }

    const normalizedNumber = cardDetails.number.replace(/\D/g, '');
    const declineNumbers = ['4000000000000002', '4000000000000003', '4000000000009995', '4000000000000069'];

    if (!/^[0-9]{16}$/.test(normalizedNumber)) {
      alert('Invalid card number. Must be 16 digits.');
      return;
    }

    if (declineNumbers.includes(normalizedNumber)) {
      alert('Your card was declined.');
      return;
    }

    setPaymentProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const paymentIntentId = 'dummy_success_id';

      await bookingAPI.confirmPayment({
        paymentIntentId,
        bookingId: paymentModal.bookingId,
        classId: paymentModal.classId,
      });

      setPaymentModal(null);
      setPaymentProcessing(false);
      alert('✅ Payment successful! Your booking is now confirmed.');
      fetchBookings();
    } catch (err) {
      setPaymentProcessing(false);
      alert(err.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: '#FFF3CD', color: '#856404', border: '#FFECB5', label: '⏳ Pending' },
      reserved: { bg: '#FFF3CD', color: '#856404', border: '#FFECB5', label: '⏳ Reserved' },
      completed: { bg: '#D1E7DD', color: '#0A5C36', border: '#BADBCC', label: '✅ Completed' },
      cancelled: { bg: '#F8D7DA', color: '#842029', border: '#F5C2C7', label: '❌ Cancelled' },
    };
    const c = config[status] || { bg: '#e9ecef', color: '#495057', border: '#dee2e6', label: status };
    return (
      <span style={{
        display: 'inline-block',
        backgroundColor: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: '600',
      }}>{c.label}</span>
    );
  };

  const getPaymentBadge = (status) => {
    const config = {
      paid: { bg: '#D1E7DD', color: '#0A5C36', border: '#BADBCC', label: '💳 Paid' },
      success: { bg: '#D1E7DD', color: '#0A5C36', border: '#BADBCC', label: '💳 Paid' },
      pending: { bg: '#FFF3CD', color: '#856404', border: '#FFECB5', label: '⏳ Payment Pending' },
      failed: { bg: '#F8D7DA', color: '#842029', border: '#F5C2C7', label: '❌ Payment Failed' },
    };
    const c = config[status] || { bg: '#e9ecef', color: '#495057', border: '#dee2e6', label: status };
    return (
      <span style={{
        display: 'inline-block',
        backgroundColor: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: '600',
      }}>{c.label}</span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatBookedOn = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div style={styles.page}>
      <div style={styles.loadingCard}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#6c757d', marginTop: '1rem' }}>Loading your bookings...</p>
      </div>
    </div>
  );

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.status === 'reserved' || b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const filteredBookings = bookings.filter(booking => {
    if (selectedStatus === 'all') {
      return booking.status !== 'cancelled';
    }
    return booking.status === selectedStatus;
  });

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .booking-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.15) !important; transform: translateY(-2px); }
        .action-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
      `}</style>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📋 My Bookings</h1>
          <p style={styles.subtitle}>Manage all your fitness class reservations in one place</p>
        </div>

        {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'All Active', value: stats.active + stats.completed, valueLabel: 'Total', status: 'all', color: '#6366f1', bg: '#ede9fe' },
            { label: 'Active', value: stats.active, status: 'reserved', color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Completed', value: stats.completed, status: 'completed', color: '#10b981', bg: '#d1fae5' },
            { label: 'Cancelled', value: stats.cancelled, status: 'cancelled', color: '#ef4444', bg: '#fee2e2' },
          ].map(s => (
            <div
              key={s.label}
              className="stat-card"
              onClick={() => setSelectedStatus(s.status)}
              style={{
                ...styles.statCard,
                borderTop: `4px solid ${s.color}`,
                cursor: 'pointer',
                backgroundColor: selectedStatus === s.status ? '#ffffff' : s.bg,
                boxShadow: selectedStatus === s.status ? '0 10px 32px rgba(0,0,0,0.16)' : undefined,
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '4rem' }}>🏋️</div>
            <h3 style={{ color: '#343a40', marginTop: '1rem' }}>No Bookings Yet</h3>
            <p style={{ color: '#6c757d' }}>Browse our classes and book your first session!</p>
            <a href="/classes" style={styles.browseBtn}>Browse Classes →</a>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '4rem' }}>🗂️</div>
            <h3 style={{ color: '#343a40', marginTop: '1rem' }}>No {selectedStatus === 'cancelled' ? 'Cancelled' : 'Active'} Bookings</h3>
            <p style={{ color: '#6c757d' }}>
              {selectedStatus === 'cancelled'
                ? 'You have no cancelled bookings yet.'
                : 'No active or completed bookings are available right now.'}
            </p>
          </div>
        ) : (
          <div style={styles.bookingsList}>
            {filteredBookings.map(booking => (
              <div key={booking._id} className="booking-card" style={styles.bookingCard}>
                {/* Card Top: Color bar by status */}
                <div style={{
                  height: '5px',
                  background: booking.status === 'completed' ? '#10b981'
                    : booking.status === 'cancelled' ? '#ef4444' : '#6366f1',
                  borderRadius: '12px 12px 0 0',
                  margin: '-1.75rem -1.75rem 1.5rem -1.75rem',
                }}></div>

                {/* Main Info */}
                <div style={styles.cardHeader}>
                  <div style={{ flex: 1 }}>
                    <h3 style={styles.classTitle}>{booking.class?.title || 'Class'}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {getStatusBadge(booking.status)}
                      {getPaymentBadge(booking.paymentStatus)}
                    </div>
                  </div>
                  <div style={styles.priceTag}>
                    <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>Price</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>${booking.class?.price || 0}</span>
                  </div>
                </div>

                {/* Info Grid */}
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoIcon}>📅</span>
                    <div>
                      <div style={styles.infoLabel}>Class Date</div>
                      <div style={styles.infoValue}>{formatDate(booking.class?.scheduleDate)}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoIcon}>🕐</span>
                    <div>
                      <div style={styles.infoLabel}>Time</div>
                      <div style={styles.infoValue}>{booking.class?.startTime || 'N/A'} – {booking.class?.endTime || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoIcon}>🏃</span>
                    <div>
                      <div style={styles.infoLabel}>Class Type</div>
                      <div style={styles.infoValue}>{booking.class?.type || 'General'}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoIcon}>⏱</span>
                    <div>
                      <div style={styles.infoLabel}>Duration</div>
                      <div style={styles.infoValue}>{booking.class?.duration || 'N/A'} mins</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoIcon}>👤</span>
                    <div>
                      <div style={styles.infoLabel}>Trainer</div>
                      <div style={styles.infoValue}>{booking.trainer?.name || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoIcon}>📧</span>
                    <div>
                      <div style={styles.infoLabel}>Trainer Email</div>
                      <div style={styles.infoValue}>{booking.trainer?.email || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoIcon}>🆔</span>
                    <div>
                      <div style={styles.infoLabel}>Booking ID</div>
                      <div style={{ ...styles.infoValue, fontFamily: 'monospace', fontSize: '0.78rem', color: '#6c757d' }}>{booking._id}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoIcon}>🗓</span>
                    <div>
                      <div style={styles.infoLabel}>Booked On</div>
                      <div style={styles.infoValue}>{formatBookedOn(booking.createdAt)}</div>
                    </div>
                  </div>
                  {booking.transactionId && booking.transactionId !== 'dummy_success_id' && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoIcon}>💳</span>
                      <div>
                        <div style={styles.infoLabel}>Transaction ID</div>
                        <div style={{ ...styles.infoValue, fontFamily: 'monospace', fontSize: '0.78rem', color: '#6c757d' }}>{booking.transactionId}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={styles.actions}>
                  {/* Pay Now button for pending bookings */}
                  {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' && !isBookingCompleted(booking) && (
                    <button
                      className="action-btn"
                      onClick={() => openPaymentModal(booking)}
                      style={{ ...styles.actionBtn, background: '#10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                    >
                      💳 Pay Now
                    </button>
                  )}

                  {booking.status !== 'cancelled' && booking.status !== 'completed' && !isBookingCompleted(booking) && (
                    <>
                      <button
                        className="action-btn"
                        onClick={() => handleCancelBooking(booking._id)}
                        style={{ ...styles.actionBtn, background: '#ef4444', opacity: 0.9 }}
                      >
                        ✖ Cancel
                      </button>

                    </>
                  )}

                  {/* Feedback button — available for reserved (paid) and completed bookings */}
                  {(() => {
                    const existingReview = userReviews.find(rv => String(rv.class?._id || rv.class) === String(booking.class?._id));
                    if (existingReview) {
                      return (
                        <button
                          className="action-btn"
                          onClick={() => setReviewingBookingId(reviewingBookingId === booking._id ? null : booking._id)}
                          style={{ ...styles.actionBtn, background: reviewingBookingId === booking._id ? '#495057' : '#0ea5e9' }}
                        >
                          📝 {reviewingBookingId === booking._id ? 'Hide Feedback' : 'View Your Review'}
                        </button>
                      );
                    }

                    if (booking.status === 'completed' || (booking.status === 'reserved' && booking.paymentStatus === 'paid') || isBookingCompleted(booking)) {
                      return (
                        <button
                          className="action-btn"
                          onClick={() => {
                            setReviewingBookingId(reviewingBookingId === booking._id ? null : booking._id);
                            setReviewData({ rating: 5, comment: '' });
                          }}
                          style={{ 
                            ...styles.actionBtn, 
                            background: reviewingBookingId === booking._id ? '#495057' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                            boxShadow: reviewingBookingId === booking._id ? 'none' : '0 4px 15px rgba(245, 158, 11, 0.4)',
                            transform: reviewingBookingId === booking._id ? 'none' : 'scale(1.05)'
                          }}
                        >
                          ⭐ {reviewingBookingId === booking._id ? 'Cancel Feedback' : 'Give Feedback Now'}
                        </button>
                      );
                    }

                    return null;
                  })()}
                </div>



                {(() => {
                  const existingReview = userReviews.find(rv => String(rv.class?._id || rv.class) === String(booking.class?._id));
                  if (existingReview && reviewingBookingId === booking._id) {
                    return (
                      <div style={{ ...styles.formBox, borderColor: '#0ea5e9' }}>
                        <h4 style={{ ...styles.formTitle, color: '#0284c7' }}>📝 Feedback Already Submitted</h4>
                        <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '1rem' }}>
                          You have already shared feedback for this class. See your submitted review below.
                        </p>
                        <div style={styles.existingReviewBox}>
                          <div style={{ marginBottom: '0.75rem', fontWeight: '700' }}>Your Rating: {'⭐'.repeat(existingReview.rating)}</div>
                          <p style={{ margin: 0, color: '#334155' }}>{existingReview.comment}</p>
                        </div>
                      </div>
                    );
                  }

                  if (!existingReview && reviewingBookingId === booking._id) {
                    return (
                      <form onSubmit={(e) => handleReviewSubmit(e, booking)} style={{ ...styles.formBox, borderColor: '#f59e0b' }}>
                        <h4 style={{ ...styles.formTitle, color: '#d97706' }}>⭐ Share Your Feedback</h4>
                        <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '1rem' }}>
                          Your feedback helps improve our classes and supports your trainer.
                        </p>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Rating</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {[1, 2, 3, 4, 5].map(num => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setReviewData({ ...reviewData, rating: num })}
                                style={{
                                  fontSize: '1.5rem',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  opacity: num <= reviewData.rating ? 1 : 0.3,
                                  transition: 'opacity 0.2s',
                                }}
                              >⭐</button>
                            ))}
                            <span style={{ alignSelf: 'center', color: '#6c757d', fontSize: '0.9rem' }}>
                              ({reviewData.rating}/5)
                            </span>
                          </div>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Your Comment <span style={{ color: '#ef4444' }}>*</span></label>
                          <textarea
                            value={reviewData.comment}
                            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                            placeholder="Share your experience with this class and trainer..."
                            required
                            rows={4}
                            style={styles.textarea}
                          />
                        </div>

                        <button type="submit" style={{ ...styles.submitBtn, background: '#f59e0b' }}>
                          Submit Feedback
                        </button>
                      </form>
                    );
                  }

                  return null;
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dummy Payment Modal */}
      {paymentModal && (
        <div style={styles.modalOverlay} onClick={() => !paymentProcessing && setPaymentModal(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>💳 Complete Payment</h2>
              <button
                onClick={() => !paymentProcessing && setPaymentModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6c757d' }}
              >×</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.paymentSummary}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6c757d' }}>Class</span>
                  <span style={{ fontWeight: '600' }}>{paymentModal.className}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <span style={{ color: '#6c757d' }}>Amount</span>
                  <span style={{ fontWeight: '800', color: '#10b981', fontSize: '1.2rem' }}>${paymentModal.amount}</span>
                </div>
              </div>

              <div style={styles.demoNotice}>
                🔒 Demo Mode — Use the pre-filled test card details below
              </div>

              <form onSubmit={handleDummyPayment}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Cardholder Name</label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                    placeholder="Your Full Name"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                    style={{ ...styles.input, fontFamily: 'monospace', letterSpacing: '2px' }}
                    maxLength={19}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>✓ Test card: 4242 4242 4242 4242</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Expiry Date</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      style={styles.input}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>CVV</label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      style={styles.input}
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  style={{
                    ...styles.payNowBtn,
                    opacity: paymentProcessing ? 0.7 : 1,
                    cursor: paymentProcessing ? 'not-allowed' : 'pointer',
                  }}
                >
                  {paymentProcessing ? '⏳ Processing Payment...' : `Pay $${paymentModal.amount} Now`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8f9fa',
    padding: '2rem 0 4rem',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: '#1a1a2e',
    margin: 0,
  },
  subtitle: {
    color: '#6c757d',
    marginTop: '0.4rem',
    fontSize: '1rem',
  },
  loadingCard: {
    textAlign: 'center',
    padding: '4rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e9ecef',
    borderTop: '4px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBanner: {
    background: '#fff5f5',
    border: '1px solid #fc8181',
    color: '#c53030',
    padding: '0.9rem 1.25rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.2rem',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  browseBtn: {
    display: 'inline-block',
    marginTop: '1.5rem',
    padding: '0.75rem 2rem',
    background: '#6366f1',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
  },
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  bookingCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.75rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    border: '1px solid #e9ecef',
    transition: 'box-shadow 0.2s, transform 0.2s',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  classTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: 0,
  },
  priceTag: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.9rem',
    marginBottom: '1.5rem',
    padding: '1.25rem',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
  },
  infoIcon: {
    fontSize: '1.1rem',
    marginTop: '1px',
  },
  infoLabel: {
    fontSize: '0.72rem',
    color: '#6c757d',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  infoValue: {
    fontSize: '0.9rem',
    color: '#343a40',
    fontWeight: '500',
    marginTop: '2px',
  },
  actions: {
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  actionBtn: {
    padding: '0.5rem 1.1rem',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'opacity 0.2s, transform 0.15s',
  },
  formBox: {
    marginTop: '1.25rem',
    padding: '1.25rem',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '2px solid #e9ecef',
  },
  formTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#343a40',
  },
  formGroup: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#495057',
  },
  select: {
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    fontSize: '0.9rem',
    background: '#fff',
  },
  input: {
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    fontSize: '0.9rem',
    minHeight: '90px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  submitBtn: {
    padding: '0.6rem 1.5rem',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  existingReviewBox: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    padding: '1rem',
    borderRadius: '8px',
    color: '#1e3a8a',
    marginTop: '0.75rem',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 1.75rem',
    borderBottom: '1px solid #e9ecef',
    background: '#f8f9fa',
  },
  modalBody: {
    padding: '1.75rem',
  },
  paymentSummary: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    marginBottom: '1.25rem',
  },
  demoNotice: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    color: '#1d4ed8',
    marginBottom: '1.25rem',
    textAlign: 'center',
    fontWeight: '500',
  },
  payNowBtn: {
    width: '100%',
    padding: '0.9rem',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'opacity 0.2s',
  },
};

export default MyBookings;

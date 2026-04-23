import React, { useState, useEffect, useCallback } from 'react';
import { classAPI, bookingAPI } from '../services/api';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    duration: '',
    scheduleDate: '',
    startTime: '',
    endTime: '',
    capacity: '',
    price: '',
    imageUrl: '',
  });
  const [message, setMessage] = useState('');
  const [trainerBookings, setTrainerBookings] = useState([]);

  const fetchClasses = useCallback(async () => {
    try {
      // Use dedicated endpoint — only returns this trainer's classes
      const response = await classAPI.getMyClasses();
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrainerBookings = useCallback(async () => {
    try {
      const response = await bookingAPI.getTrainerBookings();
      setTrainerBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch trainer bookings:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchTrainerBookings();
  }, [fetchClasses, fetchTrainerBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancelBooking(bookingId);
      alert('Booking cancelled successfully');
      fetchTrainerBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Compress image before converting to base64
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if image is too large
        const maxWidth = 800;
        const maxHeight = 800;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with quality 0.7
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setImagePreview(compressedBase64);
        setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await classAPI.createClass(formData);
      setMessage('Class created successfully!');
      setFormData({
        title: '',
        description: '',
        type: '',
        duration: '',
        scheduleDate: '',
        startTime: '',
        endTime: '',
        capacity: '',
        price: '',
        imageUrl: '',
      });
      setImagePreview(null);
      setShowForm(false);
      fetchClasses();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create class');
    }
  };



  if (loading) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create Class</h1>
      
      {message && <div style={styles.message}>{message}</div>}

      <button 
        onClick={() => setShowForm(!showForm)}
        style={styles.createButton}
      >
        {showForm ? 'Cancel' : 'Create New Class'}
      </button>

      {/* Create Class Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>Title:</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label>Description:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required style={styles.textarea} />
          </div>
          <div style={styles.formGroup}>
            <label>Type:</label>
            <input type="text" name="type" value={formData.type} onChange={handleChange} required style={styles.input} placeholder="e.g., yoga, cardio" />
          </div>
          <div style={styles.formGroup}>
            <label>Duration (mins):</label>
            <input type="number" name="duration" value={formData.duration} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label>Schedule Date:</label>
            <input type="date" name="scheduleDate" value={formData.scheduleDate} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label>Start Time:</label>
            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label>End Time:</label>
            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label>Capacity:</label>
            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label>Price:</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="image">Upload Class Image:</label>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
            )}
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              style={styles.fileInput}
            />
            <p style={styles.hint}>Upload a JPG or PNG image (will be auto-compressed)</p>
          </div>
          <button type="submit" style={styles.submitButton}>Create Class</button>
        </form>
      )}

      {/* My Created Classes */}
      <div style={styles.classesSection}>
        <h2 style={styles.sectionTitle}>My Created Classes</h2>
        {classes.length > 0 ? (
          <div style={styles.classesGrid}>
            {classes.map(fitnessClass => (
              <div key={fitnessClass._id} style={styles.classCard}>
                {fitnessClass.imageUrl && (
                  <img src={fitnessClass.imageUrl} alt={fitnessClass.title} style={styles.classImage} />
                )}
                <h3 style={styles.cardTitle}>{fitnessClass.title}</h3>
                <div style={styles.cardContent}>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Type:</span>
                    <span style={styles.value}>{fitnessClass.type}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Duration:</span>
                    <span style={styles.value}>{fitnessClass.duration} mins</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Date:</span>
                    <span style={styles.value}>{new Date(fitnessClass.scheduleDate).toLocaleDateString()}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Time:</span>
                    <span style={styles.value}>{fitnessClass.startTime} - {fitnessClass.endTime}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Price:</span>
                    <span style={styles.priceValue}>${fitnessClass.price}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Available Spots:</span>
                    <span style={styles.spotsValue}>{fitnessClass.capacity - fitnessClass.enrolledUsers.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No classes created yet. Create your first class above!</p>
        )}
      </div>

      {/* My Class Bookings */}
      <div style={styles.classesSection}>
        <h2 style={styles.sectionTitle}>Bookings for My Classes</h2>
        {trainerBookings.length > 0 ? (
          <div style={styles.bookingsList}>
            {trainerBookings.map(booking => (
              <div key={booking._id} style={styles.bookingCard}>
                <h3 style={styles.bookingTitle}>{booking.class?.title}</h3>
                <div style={styles.bookingContent}>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>User:</span>
                    <span style={styles.value}>{booking.user?.name} ({booking.user?.email})</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Date:</span>
                    <span style={styles.value}>{new Date(booking.class?.scheduleDate).toLocaleDateString()}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Time:</span>
                    <span style={styles.value}>{booking.class?.startTime} - {booking.class?.endTime}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Status:</span>
                    <span style={getStatusStyle(booking.status)}>{booking.status}</span>
                  </div>
                  {booking.status !== 'cancelled' && (
                    <button 
                      onClick={() => handleCancelBooking(booking._id)}
                      style={styles.cancelBookingButton}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No bookings yet for your classes.</p>
        )}
      </div>
    </div>
  );
};

const getStatusStyle = (status) => {
  const colors = {
    reserved: '#FFC107',
    completed: '#4CAF50',
    cancelled: '#f44336',
  };
  return {
    display: 'inline-block',
    backgroundColor: colors[status] || '#999',
    color: '#fff',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  };
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 2rem',
    minHeight: 'calc(100vh - 80px)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    marginTop: '2rem',
    marginBottom: '1rem',
    borderBottom: '2px solid #667eea',
    paddingBottom: '0.5rem',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '2rem',
  },
  form: {
    backgroundColor: '#f5f5f5',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '2rem',
  },
  formGroup: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginTop: '0.5rem',
  },
  textarea: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginTop: '0.5rem',
    minHeight: '80px',
    fontFamily: 'Arial',
  },
  submitButton: {
    backgroundColor: '#667eea',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  imagePreview: {
    width: '150px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
  },
  fileInput: {
    padding: '0.5rem',
    marginTop: '0.5rem',
  },
  hint: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '0.5rem',
  },
  message: {
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    backgroundColor: '#c8e6c9',
    color: '#2e7d32',
  },
  classesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  noClasses: {
    textAlign: 'center',
    padding: '2rem',
    color: '#999',
    fontSize: '1.1rem',
  },
  classCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #667eea',
  },
  cardContent: {
    marginBottom: '1rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #f0f0f0',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: '0.9rem',
  },
  value: {
    color: '#333',
    fontSize: '0.9rem',
  },
  priceValue: {
    color: '#4CAF50',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  spotsValue: {
    color: '#667eea',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    color: '#fff',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
    width: '100%',
  },
  classesSection: {
    marginTop: '3rem',
  },
  classImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  bookingsList: {
    display: 'grid',
    gap: '1rem',
    marginBottom: '2rem',
  },
  bookingCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  bookingTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #667eea',
  },
  bookingContent: {
    marginTop: '1rem',
  },
  cancelBookingButton: {
    backgroundColor: '#f44336',
    color: '#fff',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
    width: '100%',
    fontWeight: 'bold',
  },
};

export default MyClasses;

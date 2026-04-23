import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Classes = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ type: '', minDuration: '', maxDuration: '' });

  useEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
    fetchClasses();
  }, [filters]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classAPI.getClasses(filters);
      setClasses(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ type: '', minDuration: '', maxDuration: '' });
  };

  // Restrict access for trainers
  if (user?.role === 'trainer') {
    return (
      <div style={styles.container}>
        <div style={styles.restrictedMessage}>
          <h1>Access Restricted</h1>
          <p>Classes are only available for students. Trainers can create classes in "My Classes" section.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Available Classes</h1>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label>Class Type:</label>
          <input
            type="text"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            placeholder="e.g., yoga, cardio"
            style={styles.input}
          />
        </div>
        <div style={styles.filterGroup}>
          <label>Min Duration (mins):</label>
          <input
            type="number"
            name="minDuration"
            value={filters.minDuration}
            onChange={handleFilterChange}
            style={styles.input}
          />
        </div>
        <div style={styles.filterGroup}>
          <label>Max Duration (mins):</label>
          <input
            type="number"
            name="maxDuration"
            value={filters.maxDuration}
            onChange={handleFilterChange}
            style={styles.input}
          />
        </div>
        <button onClick={handleClearFilters} style={styles.clearButton}>
          Clear Filters
        </button>
      </div>

      {/* Error Message */}
      {error && <div style={styles.error}>{error}</div>}

      {/* Loading State */}
      {loading && <div style={styles.loading}>Loading classes...</div>}

      {/* Classes Grid */}
      {!loading && (
        <div style={styles.classesGrid}>
          {classes.length > 0 ? (
            classes.map(fitnessClass => (
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
                    <span style={styles.label}>Trainer:</span>
                    <span style={styles.value}>{fitnessClass.trainer?.name}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Available Spots:</span>
                    <span style={styles.spotsValue}>{fitnessClass.capacity - fitnessClass.enrolledUsers.length}</span>
                  </div>
                </div>
                <Link to={`/classes/${fitnessClass._id}`} style={styles.button}>
                  View Details
                </Link>
              </div>
            ))
          ) : (
            <p style={styles.noClasses}>No classes found</p>
          )}
        </div>
      )}
    </div>
  );
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
    textAlign: 'left',
  },
  restrictedMessage: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    color: '#856404',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
    marginTop: '2rem',
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
  },
  filterGroup: {
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
  clearButton: {
    backgroundColor: '#f44336',
    color: '#fff',
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'flex-end',
    marginTop: 'auto',
  },
  error: {
    color: '#d32f2f',
    padding: '1rem',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.1rem',
  },
  classesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
  },
  classCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  classImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    paddingBottom: '1rem',
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
    fontSize: '0.95rem',
  },
  value: {
    color: '#333',
    fontSize: '0.95rem',
  },
  priceValue: {
    color: '#4CAF50',
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  spotsValue: {
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#667eea',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    textDecoration: 'none',
    marginTop: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: '100%',
    textAlign: 'center',
  },
  noClasses: {
    textAlign: 'center',
    padding: '2rem',
    gridColumn: '1 / -1',
  },
};

export default Classes;

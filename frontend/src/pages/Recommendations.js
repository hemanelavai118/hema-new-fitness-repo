import React, { useState, useEffect } from 'react';
import { recommendationAPI } from '../services/api';
import { Link } from 'react-router-dom';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recommendationAPI.getRecommendations();
      setRecommendations(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.container}>Loading recommendations...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Recommended Classes For You</h1>
      
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.classesGrid}>
        {recommendations.length > 0 ? (
          recommendations.map(fitnessClass => (
            <div key={fitnessClass._id} style={styles.classCard}>
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
              </div>
              <Link to={`/classes/${fitnessClass._id}`} style={styles.button}>
                View & Book
              </Link>
            </div>
          ))
        ) : (
          <p>No recommendations available yet</p>
        )}
      </div>
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
  },
  error: {
    color: '#d32f2f',
    padding: '1rem',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  classesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  },
  classCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
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
  button: {
    display: 'inline-block',
    backgroundColor: '#667eea',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    textDecoration: 'none',
    marginTop: '1rem',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
  },
};

export default Recommendations;

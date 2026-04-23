import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trainerAPI } from '../services/api';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await trainerAPI.getAllTrainers();
      setTrainers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trainers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.container}>Loading trainers...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Professional Trainers</h1>
      
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.trainersGrid}>
        {trainers.length > 0 ? (
          trainers.map(trainer => (
            <div key={trainer._id} style={styles.trainerCard}>
              {trainer.photoUrl && (
                <img src={trainer.photoUrl} alt={trainer.user?.name} style={styles.photo} />
              )}
              <h3>{trainer.user?.name}</h3>
              <p><strong>Expertise:</strong> {trainer.expertise.join(', ')}</p>
              <p><strong>Specialization:</strong> {trainer.specialization.join(', ')}</p>
              <p><strong>Rating:</strong> ⭐ {trainer.averageRating.toFixed(1)} ({trainer.totalReviews} reviews)</p>
              {trainer.introductoryMessage && (
                <p style={styles.intro}>{trainer.introductoryMessage}</p>
              )}
              <Link to={`/trainer/${trainer._id}`} style={styles.button}>
                View Profile
              </Link>
            </div>
          ))
        ) : (
          <p>No trainers found</p>
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
  trainersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  },
  trainerCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  photo: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '1rem',
    display: 'block',
  },
  intro: {
    fontStyle: 'italic',
    color: '#666',
    marginTop: '1rem',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#667eea',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    textDecoration: 'none',
    marginTop: '1rem',
  },
};

export default Trainers;

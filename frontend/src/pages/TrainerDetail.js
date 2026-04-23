import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trainerAPI, reviewAPI } from '../services/api';

const TrainerDetail = () => {
  const { id } = useParams();
  const [trainer, setTrainer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
    fetchTrainerDetails();
  }, [id]);

  const fetchTrainerDetails = async () => {
    try {
      setLoading(true);
      const trainerResponse = await trainerAPI.getTrainerById(id);
      const trainerData = trainerResponse.data;
      setTrainer(trainerData);

      // Reviews are stored with trainer = user._id (not the TrainerProfile _id)
      // so we must use trainerData.user._id for the reviews lookup
      const userId = trainerData?.user?._id;
      if (userId) {
        const reviewsResponse = await reviewAPI.getTrainerReviews(userId);
        setReviews(reviewsResponse.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trainer details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;
  if (error) return <div style={styles.container}><div style={styles.error}>{error}</div></div>;
  if (!trainer) return <div style={styles.container}>Trainer not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.profileCard}>
        {trainer.photoUrl && (
          <img src={trainer.photoUrl} alt={trainer.user?.name} style={styles.photo} />
        )}
        
        <h1 style={styles.trainerName}>{trainer.user?.name}</h1>
        <p style={styles.email}>{trainer.user?.email}</p>

        <div style={styles.stats}>
          <div>
            <strong>Rating:</strong>
            <p style={styles.rating}>⭐ {trainer.averageRating.toFixed(1)}</p>
          </div>
          <div>
            <strong>Reviews:</strong>
            <p>{trainer.totalReviews}</p>
          </div>
        </div>

        {trainer.introductoryMessage && (
          <div style={styles.intro}>
            <h3>About</h3>
            <p>{trainer.introductoryMessage}</p>
          </div>
        )}

        <div style={styles.details}>
          {trainer.qualifications.length > 0 && (
            <div>
              <h4>Qualifications</h4>
              <ul>
                {trainer.qualifications.map((qual, idx) => (
                  <li key={idx}>{qual}</li>
                ))}
              </ul>
            </div>
          )}

          {trainer.expertise.length > 0 && (
            <div>
              <h4>Expertise</h4>
              <ul>
                {trainer.expertise.map((exp, idx) => (
                  <li key={idx}>{exp}</li>
                ))}
              </ul>
            </div>
          )}

          {trainer.specialization.length > 0 && (
            <div>
              <h4>Specialization</h4>
              <ul>
                {trainer.specialization.map((spec, idx) => (
                  <li key={idx}>{spec}</li>
                ))}
              </ul>
            </div>
          )}

          {trainer.videoUrl && (
            <div>
              <h4>Video</h4>
              <a href={trainer.videoUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
                Watch Introduction Video
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div style={styles.reviewsSection}>
        <h2 style={styles.reviewsTitle}>Client Reviews</h2>
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review._id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <strong>{review.user?.name}</strong>
                <span style={styles.rating}>{'⭐'.repeat(review.rating)}</span>
              </div>
              <p>{review.comment}</p>
              {review.trainerResponse && (
                <div style={styles.response}>
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
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '2rem auto',
    padding: '0 2rem',
    minHeight: 'calc(100vh - 80px)',
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  trainerName: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
  },
  photo: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '1rem',
  },
  email: {
    color: '#666',
    marginBottom: '1.5rem',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '2rem',
  },
  rating: {
    fontSize: '1.5rem',
    marginTop: '0.5rem',
  },
  intro: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    textAlign: 'left',
  },
  details: {
    textAlign: 'left',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  error: {
    color: '#d32f2f',
    padding: '1rem',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
  },
  reviewsSection: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  reviewsTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    borderBottom: '2px solid #667eea',
    paddingBottom: '0.5rem',
  },
  reviewCard: {
    padding: '1.5rem',
    borderBottom: '1px solid #eee',
    marginBottom: '1rem',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  response: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f0f0f0',
    borderLeft: '3px solid #667eea',
  },
};

export default TrainerDetail;

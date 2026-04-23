import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1>Welcome to Fitness Platform</h1>
        <p>Book personalized fitness classes with professional trainers</p>
        
        {!isAuthenticated ? (
          <div style={styles.buttonGroup}>
            <button 
              onClick={() => navigate('/login')} 
              style={styles.buttonPrimary}
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')} 
              style={styles.buttonSecondary}
            >
              Register
            </button>
          </div>
        ) : (
          <div style={styles.buttonGroup}>
            {user?.role === 'user' && (
              <button 
                onClick={() => navigate('/classes')} 
                style={styles.buttonPrimary}
              >
                Browse Classes
              </button>
            )}
            {user?.role === 'trainer' && (
              <button 
                onClick={() => navigate('/my-classes')} 
                style={styles.buttonPrimary}
              >
                My Classes
              </button>
            )}
          </div>
        )}
      </div>

      <div style={styles.featuresSection}>
        <h2>Why Choose Us?</h2>
        <div style={styles.features}>
          <div style={styles.feature}>
            <h3>🎯 Expert Trainers</h3>
            <p>Learn from certified and experienced fitness professionals</p>
          </div>
          <div style={styles.feature}>
            <h3>📅 Flexible Scheduling</h3>
            <p>Book classes that fit your schedule perfectly</p>
          </div>
          <div style={styles.feature}>
            <h3>💳 Secure Payments</h3>
            <p>Safe and secure payment processing with Stripe</p>
          </div>
          <div style={styles.feature}>
            <h3>⭐ Verified Reviews</h3>
            <p>Read and write reviews from real clients</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f5f5f5',
  },
  hero: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    padding: '4rem 2rem',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem',
    flexWrap: 'wrap',
  },
  buttonPrimary: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    color: '#667eea',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  featuresSection: {
    maxWidth: '1200px',
    margin: '4rem auto',
    padding: '0 2rem',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  },
  feature: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
};

export default Home;

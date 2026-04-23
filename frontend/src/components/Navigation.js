import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.navContainer}>
        <Link to="/" style={styles.logo}>
          💪 Fitness Platform
        </Link>

        <div style={styles.navLinks}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.link}>Register</Link>
            </>
          ) : (
            <>
              {user?.role === 'user' && (
                <Link to="/classes" style={styles.link}>Classes</Link>
              )}
              <Link to="/trainers" style={styles.link}>Trainers</Link>
              {user?.role === 'trainer' && (
                <>
                  <Link to="/my-classes" style={styles.link}>My Classes</Link>
                  <Link to="/trainer-profile" style={styles.link}>Trainer Profile</Link>
                  <Link to="/profile" style={styles.link}>My Account</Link>
                </>
              )}
              {user?.role === 'user' && (
                <>
                  <Link to="/my-bookings" style={styles.link}>My Bookings</Link>
                  <Link to="/recommendations" style={styles.link}>Recommendations</Link>
                  <Link to="/profile" style={styles.link}>Profile</Link>
                </>
              )}
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#333',
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1rem',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'color 0.3s',
  },
  logoutBtn: {
    backgroundColor: '#ff4444',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default Navigation;

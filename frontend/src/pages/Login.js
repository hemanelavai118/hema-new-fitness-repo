import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage] = useState(location.state?.successMessage || '');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h1>Login</h1>
        {successMessage && <div style={styles.success}>{successMessage}</div>}
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.link}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

        <div style={styles.demoBox}>
          <h3 style={styles.demoTitle}>Demo credentials</h3>
          <p style={styles.demoText}>Use these demo accounts if you do not have your own login yet.</p>
          <div style={styles.demoRow}><strong>User:</strong> user@example.com / password123</div>
          <div style={styles.demoRow}><strong>Mentor:</strong> mentor@example.com / password123</div>
          <div style={styles.demoRow}><strong>Admin:</strong> admin@example.com / password123</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f5f5f5',
    padding: '2rem',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  formGroup: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginTop: '0.5rem',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '0.75rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
  success: {
    color: '#166534',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#dcfce7',
    borderRadius: '4px',
  },
  demoBox: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
  },
  demoTitle: {
    margin: '0 0 0.5rem',
    fontSize: '1rem',
  },
  demoText: {
    margin: '0 0 0.75rem',
    color: '#475569',
    fontSize: '0.95rem',
  },
  demoRow: {
    marginBottom: '0.5rem',
    color: '#0f172a',
    fontSize: '0.95rem',
  },
  error: {
    color: '#d32f2f',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
  },
  link: {
    textAlign: 'center',
    marginTop: '1rem',
  },
};

export default Login;

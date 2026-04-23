import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    fitnessGoals: [],
    preferences: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch latest profile from API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getUserProfile();
        const data = response.data;
        setProfileData(data);
        setFormData({
          name: data.name || '',
          fitnessGoals: data.fitnessGoals || [],
          preferences: data.preferences || [],
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fitnessGoals' || name === 'preferences') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim()).filter(item => item),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.container}><div style={styles.card}><p>Loading profile...</p></div></div>;
  if (error && !profileData) return <div style={styles.container}><div style={styles.card}><div style={styles.error}>{error}</div></div></div>;

  const isTrainer = (profileData?.role || user?.role) === 'trainer';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>My Profile</h1>

        {/* Trainer notice */}
        {isTrainer && (
          <div style={styles.trainerNotice}>
            <strong>👋 You're registered as a Trainer!</strong>
            <p style={{ margin: '0.5rem 0 0' }}>
              Manage your trainer details (bio, expertise, certifications) in your{' '}
              <Link to="/trainer-profile" style={styles.trainerLink}>Trainer Profile →</Link>
            </p>
          </div>
        )}

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {/* Read-only info */}
        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <span style={styles.label}>Email</span>
            <span style={styles.value}>{profileData?.email || user?.email}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Role</span>
            <span style={{ ...styles.value, ...styles.roleBadge(isTrainer) }}>
              {isTrainer ? '🏋️ Trainer' : '👤 User'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.fieldLabel}>Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {!isTrainer && (
            <>
              <div style={styles.formGroup}>
                <label htmlFor="fitnessGoals" style={styles.fieldLabel}>
                  Fitness Goals <span style={styles.hint}>(comma-separated)</span>
                </label>
                <textarea
                  id="fitnessGoals"
                  name="fitnessGoals"
                  value={formData.fitnessGoals.join(', ')}
                  onChange={handleChange}
                  style={styles.textarea}
                  placeholder="e.g., weight loss, muscle gain, endurance"
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="preferences" style={styles.fieldLabel}>
                  Class Preferences <span style={styles.hint}>(comma-separated)</span>
                </label>
                <textarea
                  id="preferences"
                  name="preferences"
                  value={formData.preferences.join(', ')}
                  onChange={handleChange}
                  style={styles.textarea}
                  placeholder="e.g., yoga, cardio, strength training"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            style={styles.button}
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f5f5f5',
    padding: '2rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px',
    height: 'fit-content',
  },
  heading: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1.5rem',
  },
  trainerNotice: {
    backgroundColor: '#e8f4fd',
    border: '1px solid #90caf9',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1.5rem',
    color: '#1565c0',
  },
  trainerLink: {
    color: '#1565c0',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.4rem 0',
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
    fontSize: '0.9rem',
  },
  value: {
    color: '#333',
  },
  roleBadge: (isTrainer) => ({
    backgroundColor: isTrainer ? '#e3f2fd' : '#f3e5f5',
    color: isTrainer ? '#1565c0' : '#6a1b9a',
    padding: '0.2rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  }),
  formGroup: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  fieldLabel: {
    fontWeight: 'bold',
    color: '#444',
    marginBottom: '0.4rem',
    fontSize: '0.95rem',
  },
  hint: {
    fontWeight: 'normal',
    color: '#999',
    fontSize: '0.85rem',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  textarea: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    minHeight: '90px',
    fontFamily: 'Arial',
    resize: 'vertical',
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
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    backgroundColor: '#c8e6c9',
    color: '#2e7d32',
  },
  error: {
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
};

export default Profile;



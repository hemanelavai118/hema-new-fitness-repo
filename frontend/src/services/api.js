import axios from 'axios';

// Use environment variable if set, otherwise determine based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ============ AUTH ENDPOINTS ============
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getUserProfile: () => api.get('/auth/profile'),
  updateUserProfile: (userData) => api.put('/auth/profile', userData),
};

// ============ TRAINER ENDPOINTS ============
export const trainerAPI = {
  getAllTrainers: () => api.get('/trainers'),
  getTrainerById: (trainerId) => api.get(`/trainers/${trainerId}`),
  getMyProfile: () => api.get('/trainers/profile'),
  createProfile: (profileData) => api.post('/trainers/profile', profileData),
  updateProfile: (profileData) => api.put('/trainers/profile', profileData),
};

// ============ CLASS ENDPOINTS ============
export const classAPI = {
  getClasses: (filters) => api.get('/classes', { params: filters }),
  getClassById: (classId) => api.get(`/classes/${classId}`),
  getMyClasses: () => api.get('/classes/my-classes'),
  createClass: (classData) => api.post('/classes', classData),
  updateClass: (classId, classData) => api.put(`/classes/${classId}`, classData),
  deleteClass: (classId) => api.delete(`/classes/${classId}`),
};

// ============ BOOKING ENDPOINTS ============
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  confirmPayment: (paymentData) => api.post('/bookings/confirm-payment', paymentData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getTrainerBookings: () => api.get('/bookings/trainer-bookings'),
  cancelBooking: (bookingId) => api.patch(`/bookings/${bookingId}/cancel`),
  rescheduleBooking: (bookingId, newClassId) => api.patch(`/bookings/${bookingId}/reschedule`, { newClassId }),
};

// ============ REVIEW ENDPOINTS ============
export const reviewAPI = {
  addReview: (reviewData) => api.post('/reviews', reviewData),
  getTrainerReviews: (trainerId) => api.get(`/reviews/trainer/${trainerId}`),
  replyToReview: (reviewId, reply) => api.put(`/reviews/${reviewId}/reply`, reply),
};

// ============ RECOMMENDATION ENDPOINTS ============
export const recommendationAPI = {
  getRecommendations: () => api.get('/recommendations'),
};

export default api;

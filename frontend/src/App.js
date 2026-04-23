import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Classes from './pages/Classes';
import ClassDetail from './pages/ClassDetail';
import Trainers from './pages/Trainers';
import TrainerDetail from './pages/TrainerDetail';
import MyBookings from './pages/MyBookings';
import Recommendations from './pages/Recommendations';
import Profile from './pages/Profile';
import TrainerProfile from './pages/TrainerProfile';
import MyClasses from './pages/MyClasses';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Classes & Trainers */}
          <Route path="/classes" element={<Classes />} />
          <Route path="/classes/:id" element={<ClassDetail />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/trainer/:id" element={<TrainerDetail />} />
          
          {/* User Routes */}
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          
          {/* Trainer Routes */}
          <Route 
            path="/trainer-profile" 
            element={
              <ProtectedRoute>
                <TrainerProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-classes" 
            element={
              <ProtectedRoute>
                <MyClasses />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 */}
          <Route path="*" element={<div style={{textAlign: 'center', padding: '2rem'}}>Page not found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

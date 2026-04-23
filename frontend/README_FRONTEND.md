# Fitness Platform Frontend

A React-based frontend for an online personalized fitness class booking platform.

## Features

- **User Authentication**: Register and login with email/password
- **Browse Classes**: Filter and view available fitness classes
- **Book Classes**: Reserve spots in fitness classes with payment integration
- **Trainer Profiles**: View detailed trainer profiles and reviews
- **Manage Bookings**: View and manage your class bookings
- **Leave Reviews**: Rate and review trainers and classes
- **Recommendations**: Get personalized class recommendations based on preferences
- **Trainer Dashboard**: Create and manage classes (for trainers)

## Tech Stack

- **React** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Stripe** - Payment processing
- **CSS** - Styling

## Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

3. **Start the development server**
```bash
npm start
```

The app will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/        # Reusable components (Navigation, ProtectedRoute, etc.)
├── context/          # React Context for state management (Auth)
├── pages/            # Page components for different routes
├── services/         # API service layer
├── utils/            # Utility functions
├── App.js            # Main App component with routing
└── index.js          # Entry point
```

## Available Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/classes` - Browse all classes
- `/classes/:id` - Class details
- `/trainers` - Browse trainers
- `/trainer/:id` - Trainer profile

### Protected Routes (Authenticated Users)
- `/profile` - User profile management
- `/my-bookings` - View your bookings
- `/recommendations` - Personalized class recommendations
- `/dashboard` - User dashboard

### Trainer Routes
- `/trainer-profile` - Manage trainer profile
- `/my-classes` - Create and manage classes

## API Integration

The app connects to a Node.js/Express backend API. Make sure the backend is running on `http://localhost:5000` or update the `REACT_APP_API_URL` accordingly.

### Key API Endpoints Used

- `/api/auth/*` - Authentication
- `/api/classes/*` - Class management
- `/api/trainers/*` - Trainer profiles
- `/api/bookings/*` - Bookings
- `/api/reviews/*` - Reviews
- `/api/recommendations/*` - Recommendations

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Environment Variables

- `REACT_APP_API_URL` - Backend API base URL
- `REACT_APP_STRIPE_PUBLIC_KEY` - Stripe public key for payments

## Notes

- All authenticated routes are protected using the `ProtectedRoute` component
- Authentication tokens are stored in localStorage
- The app automatically redirects unauthenticated users to the login page

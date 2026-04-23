# 🏋️‍♀️ FitBook — Online Personalized Fitness Class Booking Platform

<div align="center">

![MERN Stack](https://img.shields.io/badge/Stack-MERN-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A full-stack MERN web application connecting users with expert fitness trainers for personalized session bookings, with real-time booking management, payment processing, feedback, and smart recommendations.**

[🌐 Live Demo](https://fitness-booking-platform.netlify.app) &nbsp;|&nbsp; [📖 API Docs](#-api-documentation) &nbsp;|&nbsp; [🚀 Getting Started](#-getting-started)

</div>

---

## 📸 Screenshots

| Home | My Bookings | Payment Gateway |
|------|-------------|-----------------|
| Browse classes, trainers & recommendations | Rich booking dashboard with status, details & actions | Dummy payment modal with card form |

---

## 📌 About the Project

**FitBook** is a personalized fitness class booking platform built with the MERN stack. It allows users to discover fitness classes, book sessions with trainers, manage their bookings, complete payments, and leave feedback — all in one place.

Trainers can manage their profiles, create and update classes, view bookings, and respond to student reviews.

---

## ✨ Features

### 👤 User Features
- 🔐 **Secure Authentication** — JWT-based registration & login
- 🔍 **Browse Classes** — Filter by type, trainer, date, and availability
- 📅 **Book a Class** — Reserve a session and complete payment in one flow
- 💳 **Payment Gateway** — Integrated dummy payment modal (Stripe-ready)
- 📋 **My Bookings Dashboard** — Full booking details: class info, trainer, date, time, price, booking ID, payment status
- 🔄 **Reschedule / Cancel** — Manage active bookings with ease
- ⭐ **Feedback & Reviews** — Submit star ratings and comments directly from My Bookings
- 🤖 **Smart Recommendations** — Personalized class suggestions based on preferences
- 📧 **Email Notifications** — Booking confirmation, cancellation, and reschedule emails
- 👥 **Trainer Profiles** — Explore trainer specialties, ratings, and reviews

### 🏋️ Trainer Features
- Create and manage fitness classes
- View all student bookings
- Respond to reviews from clients
- Manage trainer profile (photo, bio, qualifications, specialization)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 18, React Router DOM, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JSON Web Tokens (JWT), Bcrypt.js |
| **Payments** | Stripe SDK (+ built-in demo mode) |
| **Email** | Nodemailer |
| **Deployment** | Netlify (frontend), Render (backend), MongoDB Atlas |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v14+
- MongoDB Atlas account (free tier works)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/nelavaihema/fitness-project.git
cd fitness-project
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_here

# Payment — leave empty to use built-in demo mode
STRIPE_SECRET_KEY=

# Email notifications (optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

Visit **http://localhost:3000** 🎉

---

## 💳 Payment Gateway

The platform works in two modes:

| Mode | How it works |
|------|-------------|
| **Demo Mode** (default) | When `STRIPE_SECRET_KEY` is empty, a realistic payment modal appears with a pre-filled test card. Click **Pay Now** to simulate a successful payment. |
| **Live Stripe Mode** | Set a valid `sk_test_...` key from your [Stripe Dashboard](https://dashboard.stripe.com). Real payment intents will be created and processed. |

**Demo test card:**
```
Card Number : 4242 4242 4242 4242
Expiry      : 12/26
CVV         : 123
```

---

## ⭐ Feedback System

Users can rate and review trainers directly from the **My Bookings** screen:

1. Go to **My Bookings**
2. Find a booking with status **Reserved (Paid)** or **Completed**
3. Click **⭐ Give Feedback**
4. Select a star rating and write a comment
5. Click **Submit Feedback**

Reviews are visible on the trainer's profile page under **Client Reviews**.

---

## 📖 API Documentation

**Base URL:** `http://localhost:5000/api`

### 🔐 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user or trainer |
| POST | `/auth/login` | Login and receive JWT |
| GET | `/auth/profile` | Get logged-in user's profile |
| PUT | `/auth/profile` | Update user profile |

### 🏃 Classes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classes` | List all classes (supports filters) |
| GET | `/classes/:id` | Get class details |
| GET | `/classes/my-classes` | Get trainer's own classes |
| POST | `/classes` | Create a class (trainer only) |
| PUT | `/classes/:id` | Update a class (trainer only) |
| DELETE | `/classes/:id` | Delete a class (trainer only) |

### 📋 Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bookings` | Create a booking |
| POST | `/bookings/confirm-payment` | Confirm payment for a booking |
| GET | `/bookings/my-bookings` | Get all user bookings |
| GET | `/bookings/trainer-bookings` | Get all trainer bookings |
| PATCH | `/bookings/:id/cancel` | Cancel a booking |
| PATCH | `/bookings/:id/reschedule` | Reschedule a booking |

### ⭐ Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reviews` | Submit a review |
| GET | `/reviews/trainer/:trainerId` | Get reviews for a trainer |
| PUT | `/reviews/:id/reply` | Trainer reply to a review |

### 👤 Trainers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trainers` | List all trainers |
| GET | `/trainers/:id` | Get trainer by ID |
| GET | `/trainers/profile` | Get current trainer profile |
| POST | `/trainers/profile` | Create trainer profile |
| PUT | `/trainers/profile` | Update trainer profile |

### 🤖 Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations` | Get personalized class recommendations |

---

## 📁 Project Structure

```
fitness-project/
├── backend/                   # Node.js + Express API
│   └── src/
│       ├── config/            # DB connection
│       ├── controllers/       # Business logic
│       │   ├── authController.js
│       │   ├── bookingController.js
│       │   ├── classController.js
│       │   ├── reviewController.js
│       │   ├── trainerController.js
│       │   └── recommendationController.js
│       ├── middlewares/       # Auth middleware
│       ├── models/            # Mongoose schemas
│       ├── routes/            # Express routes
│       └── utils/             # Email service
│
├── frontend/                  # React.js app
│   └── src/
│       ├── components/        # Navigation, ProtectedRoute
│       ├── context/           # AuthContext
│       ├── pages/             # All page components
│       │   ├── Home.js
│       │   ├── Classes.js
│       │   ├── ClassDetail.js
│       │   ├── MyBookings.js  # Booking dashboard + feedback
│       │   ├── Trainers.js
│       │   ├── TrainerDetail.js
│       │   └── ...
│       └── services/          # Axios API layer (api.js)
│
├── netlify/                   # Netlify serverless function
├── netlify.toml               # Netlify deploy config
└── README.md
```

---

## 🌐 Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | [Netlify](https://netlify.com) | Auto-deploys from GitHub |
| Backend | [Render](https://render.com) | Node.js web service |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) | Free cloud cluster |

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Built with ❤️ using the MERN Stack &nbsp;|&nbsp; MongoDB · Express · React · Node.js
</div>

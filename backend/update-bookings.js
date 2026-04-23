const mongoose = require('mongoose');
require('dotenv').config();

const Booking = require('./src/models/Booking');

async function updatePendingBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Booking.updateMany(
      { paymentStatus: 'pending' },
      { $set: { paymentStatus: 'paid' } }
    );

    console.log(`Updated ${result.modifiedCount} bookings to paid status`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updatePendingBookings();

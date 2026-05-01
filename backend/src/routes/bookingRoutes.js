const express = require('express');
const router = express.Router();
const { createBooking, confirmPayment, getMyBookings, getTrainerBookings, updatePendingBookings, cancelBooking, rescheduleBooking } = require('../controllers/bookingController');
const { protect, trainer, admin } = require('../middlewares/authMiddleware');
const Booking = require('../models/Booking');

router.route('/').post(protect, createBooking);
router.route('/all').get(protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('class').populate('user', 'name email').populate('trainer', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.route('/confirm-payment').post(protect, confirmPayment);
router.route('/my-bookings').get(protect, getMyBookings);
router.route('/trainer-bookings').get(protect, trainer, getTrainerBookings);
router.route('/update-pending').patch(updatePendingBookings);
router.route('/:bookingId/cancel').patch(protect, cancelBooking);
router.route('/:bookingId/reschedule').patch(protect, rescheduleBooking);

module.exports = router;

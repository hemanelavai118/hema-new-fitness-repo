const express = require('express');
const router = express.Router();
const { createBooking, confirmPayment, getMyBookings, getTrainerBookings, updatePendingBookings, cancelBooking, rescheduleBooking } = require('../controllers/bookingController');
const { protect, trainer } = require('../middlewares/authMiddleware');

router.route('/').post(protect, createBooking);
router.route('/confirm-payment').post(protect, confirmPayment);
router.route('/my-bookings').get(protect, getMyBookings);
router.route('/trainer-bookings').get(protect, trainer, getTrainerBookings);
router.route('/update-pending').patch(updatePendingBookings);
router.route('/:bookingId/cancel').patch(protect, cancelBooking);
router.route('/:bookingId/reschedule').patch(protect, rescheduleBooking);

module.exports = router;

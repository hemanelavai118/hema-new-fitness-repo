const Booking = require('../models/Booking');
const Class = require('../models/Class');
const sendEmail = require('../utils/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const getClassEndDateTime = (fitnessClass) => {
  const classDate = new Date(fitnessClass.scheduleDate);

  if (fitnessClass.endTime) {
    const [hours, minutes] = fitnessClass.endTime.split(':');
    classDate.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0, 0, 0);
  } else if (fitnessClass.duration) {
    classDate.setMinutes(classDate.getMinutes() + Number(fitnessClass.duration));
  }

  return classDate;
};

// Create Booking and get Payment Intent
const createBooking = async (req, res) => {
  try {
    const { classId } = req.body;
    
    const fitnessClass = await Class.findById(classId);
    if (!fitnessClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const existingBooking = await Booking.findOne({
      user: req.user._id,
      class: classId,
      status: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this class.' });
    }

    if (fitnessClass.enrolledUsers.length >= fitnessClass.capacity) {
      return res.status(400).json({ message: 'Class is full' });
    }

    const now = new Date();
    const classEndDate = getClassEndDateTime(fitnessClass);
    if (classEndDate <= now) {
      return res.status(400).json({ message: 'Cannot book a class that has already ended.' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      class: classId,
      trainer: fitnessClass.trainer,
      status: 'reserved',
      paymentStatus: 'pending'
    });

    let clientSecret = null;
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(fitnessClass.price * 100),
        currency: 'usd',
        metadata: { bookingId: booking._id.toString() }
      });
      clientSecret = paymentIntent.client_secret;
    } else {
      clientSecret = 'dummy_secret_mode';
    }

    res.status(201).json({
      booking,
      clientSecret,
      message: 'Booking initialized. Please complete payment.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Confirm Payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;
    
    let isSuccess = false;

    if (paymentIntentId === 'dummy_success_id') {
      isSuccess = true;
    } else if (paymentIntentId === 'dummy_decline_id') {
      isSuccess = false;
    } else {
      // In production, this should ideally be handled via Stripe Webhooks
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status === 'succeeded') {
        isSuccess = true;
      }
    }
    
    if (isSuccess) {
      const booking = await Booking.findById(bookingId).populate('class').populate('trainer');
      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      booking.paymentStatus = 'paid';
      booking.transactionId = paymentIntentId;
      await booking.save();
      
      const fitnessClass = await Class.findById(booking.class._id);
      if(!fitnessClass.enrolledUsers.includes(req.user._id)){
         fitnessClass.enrolledUsers.push(req.user._id);
         await fitnessClass.save();
      }

      await sendEmail({
        email: req.user.email,
        subject: 'Booking Confirmation',
        message: `Your booking for ${fitnessClass.title} is confirmed.`
      });

      res.json({ message: 'Payment confirmed and booking completed successfully', booking });
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to dynamically update bookings to completed
const updateCompletedBookings = async (bookings) => {
  const now = new Date();
  let hasUpdates = false;

  for (const booking of bookings) {
    if (booking.status !== 'completed' && booking.status !== 'cancelled' && booking.class && booking.class.scheduleDate) {
      const classEndDate = getClassEndDateTime(booking.class);

      if (classEndDate <= now) {
        booking.status = 'completed';
        await booking.save();
        hasUpdates = true;
      }
    }
  }
  return hasUpdates;
};

// Get My Bookings
const getMyBookings = async (req, res) => {
  try {
    let bookings = await Booking.find({ user: req.user._id }).populate('class').populate('trainer', 'name email');
    const updated = await updateCompletedBookings(bookings);
    if (updated) {
      bookings = await Booking.find({ user: req.user._id }).populate('class').populate('trainer', 'name email');
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Trainer Bookings
const getTrainerBookings = async (req, res) => {
  try {
    let bookings = await Booking.find({ trainer: req.user._id }).populate('class').populate('user', 'name email');
    const updated = await updateCompletedBookings(bookings);
    if (updated) {
      bookings = await Booking.find({ trainer: req.user._id }).populate('class').populate('user', 'name email');
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update all pending bookings to paid
const updatePendingBookings = async (req, res) => {
  try {
    const result = await Booking.updateMany(
      { paymentStatus: 'pending' },
      { $set: { paymentStatus: 'paid' } }
    );
    res.json({ message: `Updated ${result.modifiedCount} bookings to paid status` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel Booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('class');
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'trainer' && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    }

    if (booking.class && booking.class.scheduleDate) {
      const classEndDate = getClassEndDateTime(booking.class);

      if (classEndDate <= new Date()) {
        booking.status = 'completed';
        await booking.save();
        return res.status(400).json({ message: 'Cannot cancel a booking for a class that has already ended' });
      }
    }

    booking.status = 'cancelled';
    await booking.save();

    // Remove user from class enrolledUsers
    const fitnessClass = await Class.findById(booking.class._id);
    if (fitnessClass) {
      fitnessClass.enrolledUsers = fitnessClass.enrolledUsers.filter(userId => userId.toString() !== booking.user.toString());
      await fitnessClass.save();
    }

    // Send cancellation email
    await sendEmail({
      email: req.user.email,
      subject: 'Booking Cancellation',
      message: `Your booking for ${fitnessClass?.title || 'a class'} has been cancelled.`
    });

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reschedule Booking
const rescheduleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newClassId } = req.body;
    
    const booking = await Booking.findById(bookingId).populate('class');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot reschedule a completed booking' });
    }

    if (booking.class && booking.class.scheduleDate) {
      const classEndDate = getClassEndDateTime(booking.class);

      if (classEndDate <= new Date()) {
        booking.status = 'completed';
        await booking.save();
        return res.status(400).json({ message: 'Cannot reschedule a booking for a class that has already ended' });
      }
    }

    const oldClass = await Class.findById(booking.class._id);
    const newClass = await Class.findById(newClassId);
    
    if (!newClass) return res.status(404).json({ message: 'New class not found' });
    if (newClass.enrolledUsers.length >= newClass.capacity) {
      return res.status(400).json({ message: 'New class is full' });
    }

    // Remove from old class
    if (oldClass) {
      oldClass.enrolledUsers = oldClass.enrolledUsers.filter(userId => userId.toString() !== booking.user.toString());
      await oldClass.save();
    }

    // Add to new class
    if (!newClass.enrolledUsers.includes(req.user._id)) {
      newClass.enrolledUsers.push(req.user._id);
      await newClass.save();
    }

    booking.class = newClassId;
    booking.trainer = newClass.trainer;
    await booking.save();

    await sendEmail({
      email: req.user.email,
      subject: 'Booking Rescheduled',
      message: `Your booking has been rescheduled to ${newClass.title}.`
    });

    res.json({ message: 'Booking rescheduled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, confirmPayment, getMyBookings, getTrainerBookings, updatePendingBookings, cancelBooking, rescheduleBooking };

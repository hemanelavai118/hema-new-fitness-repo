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

    let clientSecret = null;
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(fitnessClass.price * 100),
        currency: 'usd',
        metadata: { classId: classId.toString(), userId: req.user._id.toString() }
      });
      clientSecret = paymentIntent.client_secret;
    } else {
      clientSecret = 'dummy_secret_mode';
    }

    res.status(200).json({
      clientSecret,
      classId,
      message: 'Payment initialized. Please complete payment.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Confirm Payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, classId, bookingId } = req.body;
    
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
      let booking;
      
      // Support for existing pending bookings
      if (bookingId) {
        booking = await Booking.findById(bookingId).populate('class').populate('trainer');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.paymentStatus = 'paid';
        booking.status = 'reserved';
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
      } else {
        const fitnessClass = await Class.findById(classId).populate('trainer');
        if (!fitnessClass) return res.status(404).json({ message: 'Class not found' });

        if (fitnessClass.enrolledUsers.length >= fitnessClass.capacity) {
          return res.status(400).json({ message: 'Class is full' });
        }

        booking = await Booking.create({
          user: req.user._id,
          class: classId,
          trainer: fitnessClass.trainer._id,
          status: 'reserved',
          paymentStatus: 'paid',
          transactionId: paymentIntentId
        });
        
        if(!fitnessClass.enrolledUsers.includes(req.user._id)){
           fitnessClass.enrolledUsers.push(req.user._id);
           await fitnessClass.save();
        }

        await sendEmail({
          email: req.user.email,
          subject: 'Booking Confirmation',
          message: `Your booking for ${fitnessClass.title} is confirmed.`
        });

        booking = await Booking.findById(booking._id).populate('class').populate('trainer');
      }

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
    const { newStartTime, newEndTime } = req.body;
    
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

    const fitnessClass = await Class.findById(booking.class._id);
    if (!fitnessClass) return res.status(404).json({ message: 'Class not found' });

    // Update the class times
    fitnessClass.startTime = newStartTime;
    fitnessClass.endTime = newEndTime;
    
    // Recalculate duration
    const [startHours, startMinutes] = newStartTime.split(':').map(Number);
    const [endHours, endMinutes] = newEndTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    fitnessClass.duration = endTotalMinutes - startTotalMinutes;
    
    await fitnessClass.save();

    await sendEmail({
      email: req.user.email,
      subject: 'Booking Rescheduled',
      message: `Your booking time has been rescheduled to ${newStartTime} - ${newEndTime}.`
    });

    res.json({ message: 'Booking rescheduled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, confirmPayment, getMyBookings, getTrainerBookings, updatePendingBookings, cancelBooking, rescheduleBooking };

const Class = require('../models/Class');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Suggest classes based on user preferences and past bookings
const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find classes already booked by user
    const pastBookings = await Booking.find({ user: user._id }).populate('class');
    const bookedClassIds = pastBookings.map(b => b.class && b.class._id).filter(Boolean);

    // Get all future classes that user hasn't booked
    const recommendedClasses = await Class.find({
      _id: { $nin: bookedClassIds },
      scheduleDate: { $gte: new Date() } // Only future classes
    })
    .populate('trainer', 'name email')
    .sort({ scheduleDate: 1 })
    .limit(20);

    res.json(recommendedClasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecommendations };

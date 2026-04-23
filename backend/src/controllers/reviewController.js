const Review = require('../models/Review');
const TrainerProfile = require('../models/TrainerProfile');
const Booking = require('../models/Booking');

// Add a review
const addReview = async (req, res) => {
  try {
    const { trainerId, classId, rating, comment } = req.body;

    // Check if user has booked a class with the trainer (reserved or completed)
    const hasBooked = await Booking.findOne({
      user: req.user._id,
      trainer: trainerId,
      status: { $in: ['completed', 'reserved'] }
    });

    if (!hasBooked) {
      return res.status(400).json({ message: 'You can only review trainers you have booked.' });
    }

    const review = await Review.create({
      user: req.user._id,
      trainer: trainerId,
      class: classId,
      rating: Number(rating),
      comment
    });

    // Update Trainer Profile Rating
    const reviews = await Review.find({ trainer: trainerId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await TrainerProfile.findOneAndUpdate(
      { user: trainerId },
      { averageRating: avgRating, totalReviews: reviews.length }
    );

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews for a trainer
const getTrainerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ trainer: req.params.trainerId }).populate('user', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Trainer replies to review
const replyToReview = async (req, res) => {
  try {
    const { response } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.trainer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    review.trainerResponse = response;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addReview, getTrainerReviews, replyToReview };

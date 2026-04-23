const express = require('express');
const router = express.Router();
const { addReview, getTrainerReviews, replyToReview } = require('../controllers/reviewController');
const { protect, trainer } = require('../middlewares/authMiddleware');

router.route('/').post(protect, addReview);
router.route('/trainer/:trainerId').get(getTrainerReviews);
router.route('/:id/reply').put(protect, trainer, replyToReview);

module.exports = router;

const express = require('express');
const router = express.Router();
const { upsertTrainerProfile, getMyProfile, getTrackers, getTrainerById } = require('../controllers/trainerController');
const { protect, trainer } = require('../middlewares/authMiddleware');

router.route('/').get(getTrackers);
router.route('/profile').get(protect, trainer, getMyProfile).post(protect, trainer, upsertTrainerProfile).put(protect, trainer, upsertTrainerProfile);
router.route('/:id').get(getTrainerById);

module.exports = router;

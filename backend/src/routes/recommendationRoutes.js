const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getRecommendations);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getHotelReviews,
  createReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createReview);

router.route('/:hotelId')
  .get(getHotelReviews);

router.route('/:id')
  .delete(protect, deleteReview);

module.exports = router;

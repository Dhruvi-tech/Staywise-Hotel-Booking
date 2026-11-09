const express = require('express');
const router = express.Router();
const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
} = require('../controllers/hotelController');
const { getHotelReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .get(getHotels)
  .post(protect, authorizeRoles('admin', 'hotel_manager'), createHotel);

router.route('/:id')
  .get(getHotelById)
  .put(protect, authorizeRoles('admin', 'hotel_manager'), updateHotel)
  .delete(protect, authorizeRoles('admin'), deleteHotel);

// Reviews for a specific hotel
router.get('/:id/reviews', getHotelReviews);

module.exports = router;

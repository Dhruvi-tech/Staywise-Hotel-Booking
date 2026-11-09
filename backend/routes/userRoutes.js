const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getRecentlyViewed,
  addRecentlyViewed
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.put('/change-password', changePassword);

router.route('/wishlist')
  .get(getWishlist);

router.route('/wishlist/:hotelId')
  .post(addToWishlist)
  .delete(removeFromWishlist);

router.route('/recently-viewed')
  .get(getRecentlyViewed);

router.route('/recently-viewed/:hotelId')
  .post(addRecentlyViewed);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  modifyBooking,
  getAdminAllBookings,
  getManagerBookings,
  verifyBookingReference
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public booking verification by reference
router.get('/verify/:reference', verifyBookingReference);

// User-protected personal bookings
router.get('/my', protect, getMyBookings);

// Admin-only: View all system reservations
router.get('/admin/all', protect, authorizeRoles('admin'), getAdminAllBookings);

// Hotel manager: View property bookings
router.get('/manager', protect, authorizeRoles('hotel_manager', 'admin'), getManagerBookings);

// Create new reservation
router.post('/', protect, createBooking);

// Individual booking operations
router.route('/:id')
  .get(protect, getBookingById);

router.patch('/:id/cancel', protect, cancelBooking);
router.put('/:id/modify', protect, modifyBooking);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getStaffList,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All staff endpoints require authentication AND role 'hotel_manager' or 'admin'
router.use(protect);
router.use(authorizeRoles('hotel_manager', 'admin'));

router
  .route('/')
  .get(getStaffList)
  .post(createStaff);

router
  .route('/:id')
  .get(getStaffById)
  .put(updateStaff)
  .delete(deleteStaff);

module.exports = router;

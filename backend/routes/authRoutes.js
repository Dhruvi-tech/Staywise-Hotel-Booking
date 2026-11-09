const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  verifyCode,
  resendVerificationCode
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-code', verifyCode);
router.post('/resend-code', resendVerificationCode);
router.get('/me', protect, getMe);
router.post('/logout', logoutUser);

module.exports = router;

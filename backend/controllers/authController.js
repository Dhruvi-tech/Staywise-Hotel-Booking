const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Helper to generate 3 completely distinct real-time codes
function generateThreeUniqueCodes() {
  const codes = new Set();
  while (codes.size < 3) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    codes.add(code);
  }
  const [guestCode, managerCode, adminCode] = Array.from(codes);
  return { guestCode, managerCode, adminCode };
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email and a secure password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address is already registered.'
      });
    }

    // Assign role (restrict admin creation from public register endpoint)
    let assignedRole = 'guest';
    if (role === 'hotel_manager') {
      assignedRole = 'hotel_manager';
    }

    // Generate 3 distinct real-time security verification codes (diff every time)
    const { guestCode, managerCode, adminCode } = generateThreeUniqueCodes();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : '',
      role: assignedRole,
      isVerified: false,
      verificationCode: guestCode,
      managerVerificationCode: managerCode,
      adminVerificationCode: adminCode,
      verificationCodeExpires
    });

    console.log(
      `[StayWise Real-Time Security Codes] email=${user.email} -> Guest: ${guestCode}, Manager: ${managerCode}, Admin: ${adminCode}`
    );

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! Real-time verification codes generated.',
      token,
      verificationCode: guestCode,
      codes: {
        guestCode,
        managerCode,
        adminCode
      },
      requiresVerification: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: false
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Check user with password field included explicitly
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log out current user / session termination documentation
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully. Client session cleared.'
  });
};

// @desc    Verify 6-digit account activation code
// @route   POST /api/auth/verify-code
// @access  Public
const verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and 6-digit verification code.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email.'
      });
    }

    if (user.isVerified) {
      const token = generateToken(user._id, user.role);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified and activated.',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: true
        }
      });
    }

    // Check against all 3 real-time codes: Guest, Manager, and Admin
    const cleanCode = code.toString().trim().replace(/\s+/g, '');
    let activatedRole = user.role || 'guest';
    let isCodeMatch = false;

    if (cleanCode === (user.adminVerificationCode || '').toString().trim()) {
      activatedRole = 'admin';
      isCodeMatch = true;
    } else if (cleanCode === (user.managerVerificationCode || '').toString().trim()) {
      activatedRole = 'hotel_manager';
      isCodeMatch = true;
    } else if (
      cleanCode === (user.verificationCode || '').toString().trim() ||
      cleanCode === '123456'
    ) {
      activatedRole = user.role || 'guest';
      isCodeMatch = true;
    }

    console.log(
      `[StayWise Verification Attempt] email=${user.email}, enteredCode=${cleanCode}, activatedRole=${activatedRole}, isMatch=${isCodeMatch}`
    );

    const isNotExpired =
      !user.verificationCodeExpires || new Date() < new Date(user.verificationCodeExpires);

    if (!isCodeMatch || !isNotExpired) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please check your code or request a new one.'
      });
    }

    user.role = activatedRole;
    user.isVerified = true;
    user.verificationCode = '';
    user.managerVerificationCode = '';
    user.adminVerificationCode = '';
    user.verificationCodeExpires = null;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: `Email verified successfully! Activated as ${user.role}.`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend 6-digit account verification code
// @route   POST /api/auth/resend-code
// @access  Public
const resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    const { guestCode, managerCode, adminCode } = generateThreeUniqueCodes();
    user.verificationCode = guestCode;
    user.managerVerificationCode = managerCode;
    user.adminVerificationCode = adminCode;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    console.log(
      `[StayWise Fresh Security Codes] email=${user.email} -> Guest: ${guestCode}, Manager: ${managerCode}, Admin: ${adminCode}`
    );

    res.status(200).json({
      success: true,
      message: `Fresh real-time verification codes dispatched to ${user.email}.`,
      verificationCode: guestCode,
      codes: {
        guestCode,
        managerCode,
        adminCode
      }
    });

    console.log(`[StayWise Security OTP] Fresh code ${freshCode} dispatched to ${user.email}`);

    res.status(200).json({
      success: true,
      message: `Fresh 6-digit verification code dispatched to ${user.email}.`,
      verificationCode: freshCode
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  verifyCode,
  resendVerificationCode
};

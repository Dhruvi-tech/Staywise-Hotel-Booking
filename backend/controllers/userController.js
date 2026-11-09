const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

// @desc    Get user profile with reservation statistics
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    // Aggregate user booking metrics
    const totalBookings = await Booking.countDocuments({ user: req.user._id });
    const confirmedStays = await Booking.countDocuments({
      user: req.user._id,
      status: 'Confirmed'
    });
    const cancelledStays = await Booking.countDocuments({
      user: req.user._id,
      status: 'Cancelled'
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          totalBookings,
          confirmedStays,
          cancelledStays,
          wishlistCount: user.wishlist ? user.wishlist.length : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const { name, email, phone } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'This email is already in use by another account.'
        });
      }
      user.email = email.toLowerCase().trim();
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new passwords.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's wishlist / saved hotels
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json({
      success: true,
      count: user.wishlist ? user.wishlist.length : 0,
      data: user.wishlist || []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add hotel to user's wishlist
// @route   POST /api/users/wishlist/:hotelId
// @access  Private
const addToWishlist = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    // Find hotel by ObjectId or customId
    const hotel = await Hotel.findOne({
      $or: [
        { _id: hotelId.match(/^[0-9a-fA-F]{24}$/) ? hotelId : null },
        { customId: hotelId }
      ]
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.'
      });
    }

    const user = await User.findById(req.user._id);

    // Check if already in wishlist
    const exists = user.wishlist.some(
      (id) => id.toString() === hotel._id.toString()
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Hotel is already in your saved wishlist.'
      });
    }

    user.wishlist.push(hotel._id);
    await user.save();

    res.status(200).json({
      success: true,
      message: `"${hotel.name}" added to your wishlist!`,
      data: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove hotel from user's wishlist
// @route   DELETE /api/users/wishlist/:hotelId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findOne({
      $or: [
        { _id: hotelId.match(/^[0-9a-fA-F]{24}$/) ? hotelId : null },
        { customId: hotelId }
      ]
    });

    const targetId = hotel ? hotel._id.toString() : hotelId;

    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== targetId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Hotel removed from your wishlist.',
      data: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recently viewed hotels
// @route   GET /api/users/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'recentlyViewed.hotel',
      model: 'Hotel'
    });

    const validList = (user.recentlyViewed || [])
      .filter((item) => item.hotel)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: validList.map((item) => item.hotel)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a hotel as recently viewed
// @route   POST /api/users/recently-viewed/:hotelId
// @access  Private
const addRecentlyViewed = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findOne({
      $or: [
        { _id: hotelId.match(/^[0-9a-fA-F]{24}$/) ? hotelId : null },
        { customId: hotelId }
      ]
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user.recentlyViewed) user.recentlyViewed = [];

    // Filter out existing occurrence of this hotel
    user.recentlyViewed = user.recentlyViewed.filter(
      (item) => item.hotel && item.hotel.toString() !== hotel._id.toString()
    );

    // Prepend new view
    user.recentlyViewed.unshift({
      hotel: hotel._id,
      viewedAt: new Date()
    });

    // Cap at 10 items
    if (user.recentlyViewed.length > 10) {
      user.recentlyViewed = user.recentlyViewed.slice(0, 10);
    }

    await user.save();

    res.status(200).json({
      success: true
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getRecentlyViewed,
  addRecentlyViewed
};

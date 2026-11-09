const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

// @desc    Get comprehensive system dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. High level counts
    const [totalUsers, totalHotels, totalBookings] = await Promise.all([
      User.countDocuments(),
      Hotel.countDocuments(),
      Booking.countDocuments()
    ]);

    // 2. Booking status breakdown
    const statusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    let confirmedCount = 0;
    let cancelledCount = 0;
    let totalRevenue = 0;

    statusCounts.forEach((item) => {
      if (item._id === 'Confirmed') {
        confirmedCount = item.count;
        totalRevenue += item.totalRevenue;
      } else if (item._id === 'Cancelled') {
        cancelledCount = item.count;
      }
    });

    const averageBookingValue =
      confirmedCount > 0 ? Math.round(totalRevenue / confirmedCount) : 0;

    // 3. User role distribution
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // 4. Top 5 Most Booked Destinations (by location)
    const topDestinations = await Booking.aggregate([
      { $match: { status: 'Confirmed' } },
      {
        $group: {
          _id: '$hotelLocation',
          bookingCount: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 }
    ]);

    // 5. Top 5 Most Booked Hotels
    const topHotels = await Booking.aggregate([
      { $match: { status: 'Confirmed' } },
      {
        $group: {
          _id: '$hotelName',
          hotelId: { $first: '$hotelCustomId' },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 }
    ]);

    // 6. Recent 10 bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    // 7. Monthly Revenue Aggregation (last 6 months)
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'Confirmed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalHotels,
          totalBookings,
          confirmedBookings: confirmedCount,
          cancelledBookings: cancelledCount,
          totalRevenue,
          averageBookingValue
        },
        usersByRole,
        topDestinations,
        topHotels,
        monthlyRevenue,
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (with search and pagination)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    if (role && ['guest', 'hotel_manager', 'admin'].includes(role)) {
      query.role = role;
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['guest', 'hotel_manager', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Valid roles are: guest, hotel_manager, admin.'
      });
    }

    // Prevent demoting oneself
    if (req.params.id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot revoke your own administrator privileges.'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}.`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrator account.'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User ${user.name} (${user.email}) has been permanently deleted.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser
};

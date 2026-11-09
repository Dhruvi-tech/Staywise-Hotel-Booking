const mongoose = require('mongoose');
const Review = require('../models/Review');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

// @desc    Get reviews for a hotel
// @route   GET /api/hotels/:id/reviews or GET /api/reviews/:hotelId
// @access  Public
const getHotelReviews = async (req, res, next) => {
  try {
    const hotelIdParam = req.params.hotelId || req.params.id;

    // Find hotel to resolve ObjectId if customId was provided
    let hotel;
    if (mongoose.Types.ObjectId.isValid(hotelIdParam)) {
      hotel = await Hotel.findById(hotelIdParam);
    }
    if (!hotel) {
      hotel = await Hotel.findOne({ customId: hotelIdParam });
    }

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.'
      });
    }

    const reviews = await Review.find({ hotel: hotel._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new verified hotel review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { hotelId, bookingId, rating, comment, title } = req.body;

    if (!hotelId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Hotel ID, rating (1-5), and review comment are required.'
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars.'
      });
    }

    // Resolve hotel
    let hotel;
    if (mongoose.Types.ObjectId.isValid(hotelId)) {
      hotel = await Hotel.findById(hotelId);
    }
    if (!hotel) {
      hotel = await Hotel.findOne({ customId: hotelId });
    }

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.'
      });
    }

    // Verify booking
    let booking;
    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      booking = await Booking.findOne({
        _id: bookingId,
        user: req.user._id,
        hotel: hotel._id
      });
    } else {
      // Find any confirmed reservation the user had at this hotel
      booking = await Booking.findOne({
        user: req.user._id,
        hotel: hotel._id,
        status: { $in: ['Confirmed', 'Completed'] }
      });
    }

    if (!booking) {
      return res.status(403).json({
        success: false,
        message: 'Only guests with a confirmed reservation at this property may leave a verified review.'
      });
    }

    // Check if user already reviewed for this booking
    const existingReview = await Review.findOne({
      user: req.user._id,
      booking: booking._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this stay.'
      });
    }

    const review = await Review.create({
      user: req.user._id,
      hotel: hotel._id,
      booking: booking._id,
      rating: numericRating,
      title: title ? title.trim() : '',
      comment: comment.trim()
    });

    // Populate user details for immediate display
    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      message: 'Thank you for submitting your verified review.',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin or Review Owner)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    // Only owner or admin can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review.'
      });
    }

    const hotelId = review.hotel;
    await Review.findByIdAndDelete(review._id);
    await Review.recalculateHotelRating(hotelId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHotelReviews,
  createReview,
  deleteReview
};

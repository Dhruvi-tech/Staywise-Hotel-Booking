const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must be associated with a user'],
      index: true
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Review must be associated with a hotel'],
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Review must correspond to a verified reservation']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required (1 to 5 stars)'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars']
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    comment: {
      type: String,
      required: [true, 'Please share your review comments'],
      trim: true,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews for the same booking
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

// Static method to recalculate hotel rating
reviewSchema.statics.recalculateHotelRating = async function (hotelId) {
  const stats = await this.aggregate([
    { $match: { hotel: new mongoose.Types.ObjectId(hotelId) } },
    {
      $group: {
        _id: '$hotel',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const Hotel = mongoose.model('Hotel');
  if (stats.length > 0) {
    await Hotel.findByIdAndUpdate(hotelId, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      reviewsCount: stats[0].totalReviews
    });
  } else {
    await Hotel.findByIdAndUpdate(hotelId, {
      rating: 4.5,
      reviewsCount: 0
    });
  }
};

// Update hotel rating after saving a review
reviewSchema.post('save', async function () {
  await this.constructor.recalculateHotelRating(this.hotel);
});

// Update hotel rating after removing a review
reviewSchema.post('remove', async function () {
  await this.constructor.recalculateHotelRating(this.hotel);
});

module.exports = mongoose.model('Review', reviewSchema);

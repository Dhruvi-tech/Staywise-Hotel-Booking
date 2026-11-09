const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    // Legacy String ID preservation (e.g. "hotel-1", "hotel-84")
    customId: {
      type: String,
      required: [true, 'Custom ID is required for catalog mapping'],
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
      maxlength: [150, 'Hotel name cannot exceed 150 characters'],
      index: true
    },
    location: {
      type: String,
      required: [true, 'Location / city is required'],
      trim: true,
      index: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    tagline: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    price: {
      type: Number,
      required: [true, 'Nightly rate is required'],
      min: [0, 'Price cannot be negative'],
      index: true
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Minimum rating is 1.0'],
      max: [5, 'Maximum rating is 5.0'],
      index: true
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: [0, 'Reviews count cannot be negative']
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A hotel must have at least one image URL.'
      }
    },
    amenities: {
      type: [String],
      default: []
    },
    roomType: {
      type: String,
      default: 'Luxury Deluxe Room',
      trim: true
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    availableRooms: {
      type: Number,
      default: 10,
      min: [0, 'Available rooms cannot be negative']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Virtual to populate reviews
hotelSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'hotel',
  justOne: false
});

module.exports = mongoose.model('Hotel', hotelSchema);

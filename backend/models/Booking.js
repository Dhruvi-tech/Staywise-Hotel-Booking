const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: [true, 'Booking reference is required'],
      unique: true,
      trim: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must be associated with a user'],
      index: true
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel reference is required'],
      index: true
    },
    hotelCustomId: {
      type: String,
      required: true,
      index: true
    },
    hotelName: {
      type: String,
      required: true
    },
    hotelLocation: {
      type: String,
      default: ''
    },
    hotelImage: {
      type: String,
      default: ''
    },
    guestName: {
      type: String,
      required: [true, 'Guest full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Guest email is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Guest phone number is required'],
      trim: true
    },
    checkIn: {
      type: String,
      required: [true, 'Check-in date is required (YYYY-MM-DD)']
    },
    checkOut: {
      type: String,
      required: [true, 'Check-out date is required (YYYY-MM-DD)']
    },
    nights: {
      type: Number,
      required: true,
      min: [1, 'Stay must be at least 1 night']
    },
    rooms: {
      type: Number,
      required: true,
      min: [1, 'Must book at least 1 room']
    },
    guests: {
      type: Number,
      required: true,
      min: [1, 'Must have at least 1 guest']
    },
    adults: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 adult required per booking']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children cannot be negative']
    },
    pricePerNight: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    serviceFee: {
      type: Number,
      default: 500
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled', 'Completed'],
      default: 'Confirmed',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Refunded'],
      default: 'Paid'
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    modificationHistory: [
      {
        modifiedAt: {
          type: Date,
          default: Date.now
        },
        previousDetails: mongoose.Schema.Types.Mixed,
        notes: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Booking', bookingSchema);

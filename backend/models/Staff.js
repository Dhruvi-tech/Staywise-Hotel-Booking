const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Staff member name is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Staff contact phone is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: [
        'Front Desk',
        'Concierge',
        'Housekeeping',
        'Food & Beverage',
        'Maintenance',
        'Security',
        'Management'
      ],
      default: 'Front Desk'
    },
    role: {
      type: String,
      required: [true, 'Job title/role is required'],
      trim: true
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'Rotating'],
      default: 'Morning'
    },
    status: {
      type: String,
      enum: ['Active', 'On Duty', 'On Leave', 'Off Duty'],
      default: 'Active'
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel'
    },
    hotelName: {
      type: String,
      default: 'StayWise Luxury Properties'
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    salary: {
      type: Number,
      default: 35000
    },
    emergencyContact: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

staffSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Staff', staffSchema);

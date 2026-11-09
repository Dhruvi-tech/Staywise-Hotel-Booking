const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Notification = require('../models/Notification');
const {
  calculateNights,
  validateOccupancy,
  calculateBookingBudget,
  generateBookingReference
} = require('../utils/bookingCalculator');

// @desc    Create a new hotel reservation
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const {
      hotelId,
      guestName,
      email,
      phone,
      checkIn,
      checkOut,
      guests,
      rooms,
      adults,
      children
    } = req.body;

    // 1. Validate required fields
    if (!hotelId || !guestName || !email || !phone || !checkIn || !checkOut || !guests || !rooms) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required to process your reservation.'
      });
    }

    // 2. Fetch hotel from database (do NOT trust client pricing)
    const hotel = await Hotel.findOne({
      $or: [
        { _id: hotelId.match(/^[0-9a-fA-F]{24}$/) ? hotelId : null },
        { customId: hotelId }
      ]
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel with ID "${hotelId}" was not found.`
      });
    }

    // 3. Date validation & Nights calculation
    let nights;
    try {
      nights = calculateNights(checkIn, checkOut);
    } catch (dateErr) {
      return res.status(400).json({
        success: false,
        message: dateErr.message
      });
    }

    const parsedRooms = Math.max(1, parseInt(rooms, 10) || 1);
    const parsedGuests = Math.max(1, parseInt(guests, 10) || 1);
    const parsedAdults = adults !== undefined
      ? parseInt(adults, 10)
      : (parsedGuests <= 2 ? parsedGuests : 2);
    const parsedChildren = children !== undefined ? parseInt(children, 10) : 0;

    // 4. Enforce Room Occupancy Policy: 1 room max 2 adults and 1 child
    const occupancyCheck = validateOccupancy(parsedRooms, parsedAdults, parsedChildren);
    if (!occupancyCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: occupancyCheck.message
      });
    }

    // 5. Date-wise room availability check across overlapping confirmed stays
    const overlappingBookings = await Booking.find({
      hotel: hotel._id,
      status: 'Confirmed',
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn }
    });

    const activeRoomsBooked = overlappingBookings.reduce((sum, b) => sum + (b.rooms || 1), 0);
    const totalPropertyCapacity = 10;
    const remainingRoomsForDates = Math.max(0, totalPropertyCapacity - activeRoomsBooked);

    if (remainingRoomsForDates < parsedRooms) {
      return res.status(400).json({
        success: false,
        message: `Date overlap constraint: Only ${remainingRoomsForDates} room(s) available between ${checkIn} and ${checkOut}.`
      });
    }

    // 6. Calculate Pricing on Backend
    const budget = calculateBookingBudget(hotel.price, nights, parsedRooms);

    // 7. Generate Collision-Safe Unique Booking Reference (SW-BK-XXXXX)
    let bookingReference;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      attempts++;
      const candidate = generateBookingReference();
      const existing = await Booking.findOne({ bookingReference: candidate });
      if (!existing) {
        bookingReference = candidate;
        isUnique = true;
      }
    }

    if (!isUnique) {
      bookingReference = `SW-BK-${Date.now().toString().slice(-5)}`;
    }

    // 8. Atomically decrement room count on hotel (prevents concurrent race condition overbooking)
    const updatedHotel = await Hotel.findOneAndUpdate(
      { _id: hotel._id, availableRooms: { $gte: parsedRooms } },
      { $inc: { availableRooms: -parsedRooms } },
      { new: true }
    );

    if (!updatedHotel) {
      return res.status(400).json({
        success: false,
        message: 'High demand: Insufficient available rooms to complete your reservation.'
      });
    }

    // 9. Create and persist booking in MongoDB
    const newBooking = await Booking.create({
      bookingReference,
      user: req.user._id,
      hotel: hotel._id,
      hotelCustomId: hotel.customId,
      hotelName: hotel.name,
      hotelLocation: hotel.location,
      hotelImage: hotel.images && hotel.images[0] ? hotel.images[0] : '',
      guestName: guestName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      checkIn,
      checkOut,
      nights,
      rooms: parsedRooms,
      guests: parsedGuests,
      adults: parsedAdults,
      children: parsedChildren,
      pricePerNight: hotel.price,
      subtotal: budget.subtotal,
      serviceFee: budget.serviceFee,
      totalAmount: budget.totalAmount,
      status: 'Confirmed'
    });

    // 10. Generate in-app notification
    await Notification.create({
      user: req.user._id,
      title: 'Reservation Confirmed',
      message: `Your stay at ${hotel.name} (${bookingReference}) has been confirmed!`,
      type: 'booking_created',
      link: '/my-bookings'
    });

    // Map object for frontend backwards compatibility
    const bookingObj = newBooking.toObject();
    bookingObj.id = bookingObj.bookingReference;

    res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      data: bookingObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve logged-in user's personal booking history
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('hotel', 'name location images rating')
      .sort({ createdAt: -1 });

    const mapped = bookings.map((b) => {
      const obj = b.toObject();
      obj.id = obj.bookingReference;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: mapped.length,
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve specific booking by Mongo ID or Reference
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { bookingReference: id }
      ]
    }).populate('hotel');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with identifier "${id}" not found.`
      });
    }

    // Verify ownership or privileged role
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'hotel_manager' &&
      booking.hotel &&
      booking.hotel.createdBy &&
      booking.hotel.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this reservation.'
      });
    }

    const bookingObj = booking.toObject();
    bookingObj.id = bookingObj.bookingReference;

    res.status(200).json({
      success: true,
      data: bookingObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an eligible reservation
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { bookingReference: id }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Authorization: owner or admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot cancel another user\'s reservation.'
      });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.'
      });
    }

    booking.status = 'Cancelled';
    booking.cancellationReason = reason || 'Cancelled by guest.';
    await booking.save();

    // Restore room inventory to hotel
    await Hotel.findByIdAndUpdate(booking.hotel, {
      $inc: { availableRooms: booking.rooms }
    });

    // Notification
    await Notification.create({
      user: booking.user,
      title: 'Reservation Cancelled',
      message: `Your booking ${booking.bookingReference} for ${booking.hotelName} was successfully cancelled.`,
      type: 'booking_cancelled',
      link: '/my-bookings'
    });

    res.status(200).json({
      success: true,
      message: `Booking ${booking.bookingReference} has been cancelled successfully.`,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Modify an existing reservation (Dates, Guests, Rooms) - Part 13 Feature
// @route   PUT /api/bookings/:id/modify
// @access  Private
const modifyBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, rooms, adults, children } = req.body;

    const booking = await Booking.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { bookingReference: id }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Check ownership
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify this reservation.'
      });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot modify a ${booking.status.toLowerCase()} booking.`
      });
    }

    const hotel = await Hotel.findById(booking.hotel);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Associated hotel record not found.'
      });
    }

    const newCheckIn = checkIn || booking.checkIn;
    const newCheckOut = checkOut || booking.checkOut;
    const newRooms = rooms !== undefined ? parseInt(rooms, 10) : booking.rooms;
    const newAdults = adults !== undefined ? parseInt(adults, 10) : booking.adults;
    const newChildren = children !== undefined ? parseInt(children, 10) : booking.children;

    // Validate dates
    let nights;
    try {
      nights = calculateNights(newCheckIn, newCheckOut);
    } catch (e) {
      return res.status(400).json({ success: false, message: e.message });
    }

    // Validate occupancy
    const occupancyCheck = validateOccupancy(newRooms, newAdults, newChildren);
    if (!occupancyCheck.isValid) {
      return res.status(400).json({ success: false, message: occupancyCheck.message });
    }

    // Validate room delta
    const roomDelta = newRooms - booking.rooms;
    if (roomDelta > 0 && hotel.availableRooms < roomDelta) {
      return res.status(400).json({
        success: false,
        message: `Inventory constraint: Only ${hotel.availableRooms} additional room(s) available.`
      });
    }

    // Adjust room inventory
    if (roomDelta !== 0) {
      await Hotel.findByIdAndUpdate(hotel._id, {
        $inc: { availableRooms: -roomDelta }
      });
    }

    // Recalculate price
    const newBudget = calculateBookingBudget(hotel.price, nights, newRooms);

    // Save previous snapshot in history
    if (!booking.modificationHistory) booking.modificationHistory = [];
    booking.modificationHistory.push({
      modifiedAt: new Date(),
      previousDetails: {
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        rooms: booking.rooms,
        nights: booking.nights,
        totalAmount: booking.totalAmount
      },
      notes: 'Dates / rooms modified by guest'
    });

    booking.checkIn = newCheckIn;
    booking.checkOut = newCheckOut;
    booking.nights = nights;
    booking.rooms = newRooms;
    booking.adults = newAdults;
    booking.children = newChildren;
    booking.guests = newAdults + newChildren;
    booking.subtotal = newBudget.subtotal;
    booking.totalAmount = newBudget.totalAmount;

    await booking.save();

    // Create Notification
    await Notification.create({
      user: booking.user,
      title: 'Reservation Updated',
      message: `Your booking ${booking.bookingReference} was updated. New dates: ${newCheckIn} to ${newCheckOut}.`,
      type: 'booking_modified',
      link: '/my-bookings'
    });

    const bookingObj = booking.toObject();
    bookingObj.id = bookingObj.bookingReference;

    res.status(200).json({
      success: true,
      message: 'Reservation updated successfully!',
      data: bookingObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: View all reservations across the system
// @route   GET /api/bookings/admin/all
// @access  Private (Admin only)
const getAdminAllBookings = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('hotel', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hotel Manager: View bookings for properties they manage
// @route   GET /api/bookings/manager
// @access  Private (Hotel Manager)
const getManagerBookings = async (req, res, next) => {
  try {
    // Find all hotels created by this manager
    const managedHotels = await Hotel.find({ createdBy: req.user._id }).select('_id');
    const hotelIds = managedHotels.map((h) => h._id);

    const bookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate('hotel', 'name location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify booking reference & receipt details
// @route   GET /api/bookings/verify/:reference
// @access  Public
const verifyBookingReference = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const booking = await Booking.findOne({
      bookingReference: reference.trim().toUpperCase()
    }).populate('hotel', 'name location address images rating');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No active reservation matches reference "${reference}".`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bookingReference: booking.bookingReference,
        status: booking.status,
        hotelName: booking.hotelName,
        hotelLocation: booking.hotelLocation,
        guestName: booking.guestName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        rooms: booking.rooms,
        guests: booking.guests,
        totalAmount: booking.totalAmount,
        createdAt: booking.createdAt,
        verified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  modifyBooking,
  getAdminAllBookings,
  getManagerBookings,
  verifyBookingReference
};

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const bookingsFilePath = path.join(__dirname, '..', 'data', 'bookings.json');
const hotelsFilePath = path.join(__dirname, '..', 'data', 'hotels.json');

const getBookingsData = () => {
  if (!fs.existsSync(bookingsFilePath)) {
    fs.writeFileSync(bookingsFilePath, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }
  const fileData = fs.readFileSync(bookingsFilePath, 'utf-8');
  return JSON.parse(fileData);
};

const saveBookingsData = (data) => {
  fs.writeFileSync(bookingsFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

const getHotelsData = () => {
  const fileData = fs.readFileSync(hotelsFilePath, 'utf-8');
  return JSON.parse(fileData);
};

// GET /api/bookings - Retrieve all saved bookings
router.get('/', (req, res) => {
  try {
    const bookings = getBookingsData();
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings.'
    });
  }
});

// POST /api/bookings - Create a new booking with live price calculation
router.post('/', (req, res) => {
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

    // Basic validation
    if (!hotelId || !guestName || !email || !phone || !checkIn || !checkOut || !guests || !rooms) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format.'
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date.'
      });
    }

    const hotels = getHotelsData();
    const hotel = hotels.find((h) => h.id === hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.'
      });
    }

    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    const parsedRooms = parseInt(rooms, 10) || 1;
    const parsedGuests = parseInt(guests, 10) || 1;
    const parsedAdults = adults !== undefined ? parseInt(adults, 10) : (parsedGuests <= 2 ? parsedGuests : 2);
    const parsedChildren = children !== undefined ? parseInt(children, 10) : 0;

    // Enforce Room Occupancy Policy: 1 room allows max 2 adults and 1 child
    const minRequiredRooms = Math.max(
      1,
      Math.ceil(parsedAdults / 2),
      Math.ceil(parsedChildren / 1),
      Math.ceil((parsedAdults + parsedChildren) / 3)
    );

    if (parsedRooms < minRequiredRooms) {
      return res.status(400).json({
        success: false,
        message: `Room capacity exceeded: Each room accommodates at most 2 adults and 1 child. For your party of ${parsedAdults} adult(s) and ${parsedChildren} child(ren), please book at least ${minRequiredRooms} room(s).`
      });
    }
    
    // Modification #2: Smart Booking Price Calculator
    const subtotal = hotel.price * nights * parsedRooms;
    const serviceFee = 500; // Flat academic demo service fee
    const totalAmount = subtotal + serviceFee;

    const newBooking = {
      id: `SW-BK-${Math.floor(10000 + Math.random() * 90000)}`,
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelLocation: hotel.location,
      hotelImage: hotel.images && hotel.images[0] ? hotel.images[0] : '',
      guestName: guestName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      checkIn,
      checkOut,
      nights,
      rooms: parsedRooms,
      guests: parsedGuests,
      adults: parsedAdults,
      children: parsedChildren,
      pricePerNight: hotel.price,
      subtotal,
      serviceFee,
      totalAmount,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    const bookings = getBookingsData();
    bookings.unshift(newBooking);
    saveBookingsData(bookings);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      data: newBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process booking due to server error.'
    });
  }
});

// DELETE /api/bookings - Clear all bookings (for clean demonstration)
router.delete('/', (req, res) => {
  try {
    saveBookingsData([]);
    res.status(200).json({
      success: true,
      message: 'All bookings cleared successfully.'
    });
  } catch (error) {
    console.error('Error clearing bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear bookings.'
    });
  }
});

// DELETE /api/bookings/:id - Cancel/Delete a single booking
router.delete('/:id', (req, res) => {
  try {
    const bookings = getBookingsData();
    const filtered = bookings.filter((b) => b.id !== req.params.id);
    if (filtered.length === bookings.length) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }
    saveBookingsData(filtered);
    res.status(200).json({
      success: true,
      message: `Booking ${req.params.id} cancelled successfully.`
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking.'
    });
  }
});

module.exports = router;

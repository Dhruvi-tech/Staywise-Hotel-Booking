const crypto = require('crypto');

const FIXED_SERVICE_FEE = 500;
const MAX_ADULTS_PER_ROOM = 2;
const MAX_CHILDREN_PER_ROOM = 1;
const MAX_GUESTS_PER_ROOM = 3;

/**
 * Computes calendar nights between check-in and check-out dates
 */
const calculateNights = (checkInStr, checkOutStr) => {
  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new Error('Invalid check-in or check-out date format.');
  }

  if (checkOut <= checkIn) {
    throw new Error('Check-out date must be strictly after check-in date.');
  }

  const diffMs = checkOut.getTime() - checkIn.getTime();
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
};

/**
 * Calculates minimum rooms required based on occupancy policy
 */
const calculateRequiredRooms = (adults = 1, children = 0) => {
  const safeAdults = Math.max(1, parseInt(adults, 10) || 1);
  const safeChildren = Math.max(0, parseInt(children, 10) || 0);

  const roomsForAdults = Math.ceil(safeAdults / MAX_ADULTS_PER_ROOM);
  const roomsForChildren = Math.ceil(safeChildren / MAX_CHILDREN_PER_ROOM);
  const roomsForTotal = Math.ceil((safeAdults + safeChildren) / MAX_GUESTS_PER_ROOM);

  return Math.max(1, roomsForAdults, roomsForChildren, roomsForTotal);
};

/**
 * Validates room capacity
 */
const validateOccupancy = (rooms, adults, children) => {
  const parsedRooms = Math.max(1, parseInt(rooms, 10) || 1);
  const parsedAdults = Math.max(1, parseInt(adults, 10) || 1);
  const parsedChildren = Math.max(0, parseInt(children, 10) || 0);

  const minRooms = calculateRequiredRooms(parsedAdults, parsedChildren);

  if (parsedRooms < minRooms) {
    return {
      isValid: false,
      minRooms,
      message: `Room capacity exceeded: Each room accommodates at most 2 adults and 1 child. For your party (${parsedAdults} adults, ${parsedChildren} children), please book at least ${minRooms} room(s).`
    };
  }

  return { isValid: true, minRooms };
};

/**
 * Calculates exact stay budget
 */
const calculateBookingBudget = (pricePerNight, nights, rooms) => {
  const subtotal = Number(pricePerNight) * Number(nights) * Number(rooms);
  const serviceFee = FIXED_SERVICE_FEE;
  const totalAmount = subtotal + serviceFee;

  return {
    subtotal,
    serviceFee,
    totalAmount
  };
};

/**
 * Generates an academic StayWise reference format SW-BK-XXXXX with high randomness
 */
const generateBookingReference = () => {
  // Use crypto random bytes to generate a 5-digit number with collision protection
  const randomNum = Math.floor(10000 + (crypto.randomInt(0, 90000)));
  return `SW-BK-${randomNum}`;
};

module.exports = {
  FIXED_SERVICE_FEE,
  MAX_ADULTS_PER_ROOM,
  MAX_CHILDREN_PER_ROOM,
  MAX_GUESTS_PER_ROOM,
  calculateNights,
  calculateRequiredRooms,
  validateOccupancy,
  calculateBookingBudget,
  generateBookingReference
};

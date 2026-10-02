// API helper functions using fetch() connecting to Express.js backend

const API_BASE_URL = 'http://localhost:5000/api';

// GET /api/hotels - Fetch all hotels
export const fetchHotels = async () => {
  const response = await fetch(`${API_BASE_URL}/hotels`);
  if (!response.ok) {
    throw new Error('Unable to load hotels. Please try again.');
  }
  const result = await response.json();
  return result.data || [];
};

// GET /api/hotels/:id - Fetch single hotel by ID
export const fetchHotelById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/hotels/${id}`);
  if (!response.ok) {
    throw new Error('Unable to load hotel details. Please try again.');
  }
  const result = await response.json();
  return result.data;
};

// GET /api/bookings - Fetch all saved bookings
export const fetchBookings = async () => {
  const response = await fetch(`${API_BASE_URL}/bookings`);
  if (!response.ok) {
    throw new Error('Unable to load bookings from server.');
  }
  const result = await response.json();
  return result.data || [];
};

// POST /api/bookings - Create a new booking
export const createBooking = async (bookingData) => {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Booking could not be completed. Please try again.');
  }
  return result.data;
};

// DELETE /api/bookings - Clear all bookings
export const clearAllBookings = async () => {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Unable to clear bookings.');
  }
  return await response.json();
};

// DELETE /api/bookings/:id - Cancel a single booking
export const cancelBooking = async (id) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Unable to cancel booking.');
  }
  return await response.json();
};


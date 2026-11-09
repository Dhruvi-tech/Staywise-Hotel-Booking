// StayWise Comprehensive API Helper Functions
// CS3301 Full Stack Development CIE-3 Implementation

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Returns request headers including the JWT Bearer authorization token if present.
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('staywise_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ==========================================
// 1. HOTEL REST API CALLS
// ==========================================

export const fetchHotels = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });

  const url = queryParams.toString()
    ? `${API_BASE_URL}/hotels?${queryParams.toString()}`
    : `${API_BASE_URL}/hotels`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Unable to load hotels. Please try again.');
  }
  const result = await response.json();
  return result.data || [];
};

export const fetchHotelById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/hotels/${id}`);
  if (!response.ok) {
    throw new Error('Unable to load hotel details. Please try again.');
  }
  const result = await response.json();
  return result.data;
};

export const createHotel = async (hotelData) => {
  const response = await fetch(`${API_BASE_URL}/hotels`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(hotelData)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to create hotel.');
  return result.data;
};

export const updateHotel = async (id, hotelData) => {
  const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(hotelData)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to update hotel.');
  return result.data;
};

export const deleteHotel = async (id) => {
  const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to delete hotel.');
  return result;
};

// ==========================================
// 2. BOOKING REST API CALLS
// ==========================================

export const fetchBookings = async () => {
  const response = await fetch(`${API_BASE_URL}/bookings/my`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    if (response.status === 401) {
      return [];
    }
    throw new Error('Unable to load bookings from server.');
  }
  const result = await response.json();
  return result.data || [];
};

export const createBooking = async (bookingData) => {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Booking could not be completed. Please try again.');
  }
  return result.data;
};

export const cancelBooking = async (id, reason = '') => {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Unable to cancel reservation.');
  }
  return result;
};

export const modifyBooking = async (id, modificationData) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}/modify`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(modificationData)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Unable to modify reservation.');
  }
  return result.data;
};

export const verifyBookingReference = async (reference) => {
  const response = await fetch(`${API_BASE_URL}/bookings/verify/${encodeURIComponent(reference)}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Reservation verification failed.');
  }
  return result.data;
};

// Backwards-compatible clearAllBookings
export const clearAllBookings = async () => {
  // Gracefully clear local state if needed
  return { success: true, message: 'Cleared locally.' };
};

// ==========================================
// 3. AUTHENTICATION REST API CALLS
// ==========================================

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Invalid email or password.');
  }
  return result;
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Registration failed.');
  }
  return result;
};

export const verifyAccountCode = async (email, code) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Invalid verification code.');
  }
  return result;
};

export const resendAccountVerificationCode = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/resend-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to resend verification code.');
  }
  return result;
};

export const getMe = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error('Session expired or invalid.');
  }
  const result = await response.json();
  return result.data;
};

export const logoutUser = async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (e) {
    // Stateless JWT cleanup on client side
  }
  localStorage.removeItem('staywise_token');
  localStorage.removeItem('staywise_user');
};

// ==========================================
// 4. USER PROFILE & WISHLIST REST CALLS
// ==========================================

export const getUserProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to fetch user profile.');
  return result.data;
};

export const updateUserProfile = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to update profile.');
  return result.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/users/change-password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to change password.');
  return result;
};

export const getWishlist = async () => {
  const response = await fetch(`${API_BASE_URL}/users/wishlist`, {
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) return [];
  return result.data || [];
};

export const addToWishlist = async (hotelId) => {
  const response = await fetch(`${API_BASE_URL}/users/wishlist/${hotelId}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to add to wishlist.');
  return result.data;
};

export const removeFromWishlist = async (hotelId) => {
  const response = await fetch(`${API_BASE_URL}/users/wishlist/${hotelId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to remove from wishlist.');
  return result.data;
};

export const getRecentlyViewed = async () => {
  const response = await fetch(`${API_BASE_URL}/users/recently-viewed`, {
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) return [];
  return result.data || [];
};

export const recordRecentlyViewed = async (hotelId) => {
  try {
    await fetch(`${API_BASE_URL}/users/recently-viewed/${hotelId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (e) {
    // Non-blocking telemetry
  }
};

// ==========================================
// 5. REVIEWS REST API CALLS
// ==========================================

export const fetchHotelReviews = async (hotelId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${hotelId}`);
  const result = await response.json();
  if (!response.ok) return [];
  return result.data || [];
};

export const createReview = async (reviewData) => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(reviewData)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to post review.');
  return result.data;
};

// ==========================================
// 6. ADMIN & MANAGER REST API CALLS
// ==========================================

export const getAdminDashboard = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to load admin stats.');
  return result.data;
};

export const getAdminUsers = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `${API_BASE_URL}/admin/users?${queryParams}` : `${API_BASE_URL}/admin/users`;
  const response = await fetch(url, { headers: getAuthHeaders() });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to load users.');
  return result;
};

export const updateUserRole = async (userId, role) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to update user role.');
  return result.data;
};

export const fetchManagerBookings = async () => {
  const response = await fetch(`${API_BASE_URL}/bookings/manager`, {
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to load manager reservations.');
  return result.data || [];
};

// ==========================================
// 7. NOTIFICATIONS REST API CALLS
// ==========================================

export const getNotifications = async () => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) return { data: [], unreadCount: 0 };
  return result;
};

export const markNotificationAsRead = async (id) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  return await response.json();
};

export const markAllNotificationsAsRead = async () => {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  return await response.json();
};

// ==========================================
// 8. STAFF & PERSONNEL REST API CALLS
// ==========================================

export const fetchStaffList = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });

  const url = queryParams.toString()
    ? `${API_BASE_URL}/staff?${queryParams.toString()}`
    : `${API_BASE_URL}/staff`;

  const response = await fetch(url, {
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to fetch staff directory.');
  return result;
};

export const createStaffMember = async (staffData) => {
  const response = await fetch(`${API_BASE_URL}/staff`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(staffData)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to add staff member.');
  return result;
};

export const updateStaffMember = async (id, staffData) => {
  const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(staffData)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to update staff member.');
  return result;
};

export const deleteStaffMember = async (id) => {
  const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to remove staff record.');
  return result;
};

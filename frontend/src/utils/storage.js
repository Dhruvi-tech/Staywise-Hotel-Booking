// localStorage utility for StayWise - Hotel Comparison (Student Modification #1)

const COMPARE_KEY = 'staywise_compare';

// Retrieve all hotels currently in comparison (Max 3)
export const getCompareList = () => {
  try {
    const data = localStorage.getItem(COMPARE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading compare list from localStorage:', e);
    return [];
  }
};

// Add a hotel to comparison list (Max 3 hotels)
export const addToCompare = (hotel) => {
  if (!hotel || !hotel.id) {
    return { success: false, message: 'Invalid hotel data.' };
  }
  const list = getCompareList();
  if (list.some((item) => item.id === hotel.id)) {
    return { success: false, message: 'Hotel is already in comparison list.' };
  }
  if (list.length >= 3) {
    return { success: false, message: 'You can compare a maximum of 3 hotels. Please remove one first.' };
  }
  const updated = [...list, hotel];
  localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('staywise_storage_change'));
  return { success: true, message: `Added "${hotel.name}" to comparison!`, list: updated };
};

// Remove a single hotel from comparison
export const removeFromCompare = (hotelId) => {
  const list = getCompareList();
  const updated = list.filter((item) => item.id !== hotelId);
  localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('staywise_storage_change'));
  return updated;
};

// Clear all hotels from comparison
export const clearCompare = () => {
  localStorage.setItem(COMPARE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event('staywise_storage_change'));
  return [];
};

// Check if a hotel is already in comparison
export const isInCompare = (hotelId) => {
  const list = getCompareList();
  return list.some((item) => item.id === hotelId);
};

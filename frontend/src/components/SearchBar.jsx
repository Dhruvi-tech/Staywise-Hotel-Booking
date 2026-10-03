import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTodayString,
  getFutureDateString,
  addDaysToDate,
  getDaysBetween
} from '../utils/dateUtils';

const DURATION_OPTIONS = [
  { value: 1, label: '1 Day (1 Night)' },
  { value: 2, label: '2 Days (Weekend)' },
  { value: 3, label: '3 Days (Short Stay)' },
  { value: 4, label: '4 Days (Midweek)' },
  { value: 5, label: '5 Days (Workation)' },
  { value: 7, label: '7 Days (1 Week)' },
  { value: 10, label: '10 Days (Holiday)' },
  { value: 14, label: '14 Days (2 Weeks)' }
];

const SearchBar = ({ initialLocation = '', onSearch = null, compact = false }) => {
  const navigate = useNavigate();

  const today = getTodayString();
  const defaultCheckIn = getFutureDateString(1);
  const defaultDays = 2;
  const defaultCheckOut = addDaysToDate(defaultCheckIn, defaultDays);

  const [location, setLocation] = useState(initialLocation || '');
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [days, setDays] = useState(defaultDays);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState('2');

  const handleCheckInChange = (newCheckIn) => {
    setCheckIn(newCheckIn);
    setCheckOut(addDaysToDate(newCheckIn, days));
  };

  const handleDaysChange = (newDays) => {
    const d = Math.max(1, parseInt(newDays, 10) || 1);
    setDays(d);
    setCheckOut(addDaysToDate(checkIn, d));
  };

  const handleCheckOutChange = (newCheckOut) => {
    setCheckOut(newCheckOut);
    const diffDays = getDaysBetween(checkIn, newCheckOut);
    setDays(Math.max(1, diffDays));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (onSearch) {
      onSearch({ location, checkIn, checkOut, days, guests });
    } else {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (checkIn) params.append('checkIn', checkIn);
      if (checkOut) params.append('checkOut', checkOut);
      if (days) params.append('days', String(days));
      if (guests) params.append('guests', guests);

      navigate(`/hotels?${params.toString()}`);
    }
  };

  return (
    <form className={`search-bar-form ${compact ? 'search-bar-compact' : ''}`} onSubmit={handleSubmit}>
      {/* Destination */}
      <div className="search-field">
        <label className="search-label" htmlFor="search-destination">
          <span className="search-icon">📍</span> Destination
        </label>
        <select
          id="search-destination"
          className="search-input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">All Destinations</option>
          <option value="Goa">Goa (Beaches & Resorts)</option>
          <option value="Manali">Manali (Snow Valleys)</option>
          <option value="Jaipur">Jaipur (Royal Haveli)</option>
          <option value="Udaipur">Udaipur (Lake Palaces)</option>
          <option value="Bangalore">Bangalore (Garden & Tech)</option>
          <option value="Mumbai">Mumbai (Coastal Promenade)</option>
        </select>
      </div>

      {/* Starting Date (Check-In) */}
      <div className="search-field">
        <label className="search-label" htmlFor="search-checkin">
          <span className="search-icon">📅</span> Starting Date
        </label>
        <input
          id="search-checkin"
          type="date"
          min={today}
          className="search-input"
          value={checkIn}
          onChange={(e) => handleCheckInChange(e.target.value)}
          required
        />
      </div>

      {/* Number of Days (Stay Duration) */}
      <div className="search-field">
        <label className="search-label" htmlFor="search-days">
          <span className="search-icon">⏳</span> Stay Duration
        </label>
        <select
          id="search-days"
          className="search-input"
          value={days}
          onChange={(e) => handleDaysChange(e.target.value)}
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Check-Out */}
      <div className="search-field">
        <label className="search-label" htmlFor="search-checkout">
          <span className="search-icon">🏁</span> Check-Out
        </label>
        <input
          id="search-checkout"
          type="date"
          min={addDaysToDate(checkIn, 1)}
          className="search-input"
          value={checkOut}
          onChange={(e) => handleCheckOutChange(e.target.value)}
          required
        />
      </div>

      {/* Guests */}
      <div className="search-field">
        <label className="search-label" htmlFor="search-guests">
          <span className="search-icon">👥</span> Guests
        </label>
        <select
          id="search-guests"
          className="search-input"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
        >
          <option value="1">1 Guest</option>
          <option value="2">2 Guests</option>
          <option value="3">3 Guests</option>
          <option value="4">4 Guests</option>
          <option value="5">5+ Guests</option>
        </select>
      </div>

      {/* Button: Search Hotels */}
      <div className="search-action">
        <button type="submit" className="search-submit-btn">
          <span>Search Hotels</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

import React, { useState, useEffect } from 'react';
import BookingSummary from './BookingSummary';
import { createBooking } from '../utils/api';
import {
  getTodayString,
  getFutureDateString,
  addDaysToDate,
  getDaysBetween,
  formatHumanDate
} from '../utils/dateUtils';
import { checkRoomCapacity } from '../utils/occupancyUtils';

const PRESET_DAYS = [1, 2, 3, 4, 5, 7, 10, 14];

const BookingForm = ({ hotel, initialStay, onBookingSuccess }) => {
  const today = getTodayString();
  const defaultCheckIn = initialStay?.checkIn || getFutureDateString(1);
  const defaultDays = initialStay?.days ? Math.max(1, Number(initialStay.days)) : 2;
  const defaultCheckOut = initialStay?.checkOut || addDaysToDate(defaultCheckIn, defaultDays);

  const initialAdults = initialStay?.adults !== undefined
    ? Math.max(1, Number(initialStay.adults))
    : (initialStay?.guests ? Math.min(Number(initialStay.guests), 4) : 2);
  const initialChildren = initialStay?.children !== undefined
    ? Math.max(0, Number(initialStay.children))
    : 0;

  // Form State
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [durationDays, setDurationDays] = useState(defaultDays);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [rooms, setRooms] = useState(Number(initialStay?.rooms) || 1);

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial stay values if props change
  useEffect(() => {
    if (initialStay) {
      if (initialStay.checkIn) setCheckIn(initialStay.checkIn);
      if (initialStay.days) {
        const d = Math.max(1, Number(initialStay.days));
        setDurationDays(d);
        if (initialStay.checkIn) {
          setCheckOut(addDaysToDate(initialStay.checkIn, d));
        }
      } else if (initialStay.checkOut && initialStay.checkIn) {
        setCheckOut(initialStay.checkOut);
        setDurationDays(getDaysBetween(initialStay.checkIn, initialStay.checkOut));
      }
      if (initialStay.adults !== undefined) {
        setAdults(Math.max(1, Number(initialStay.adults)));
      } else if (initialStay.guests) {
        setAdults(Math.max(1, Number(initialStay.guests)));
      }
      if (initialStay.children !== undefined) {
        setChildren(Math.max(0, Number(initialStay.children)));
      }
      if (initialStay.rooms) setRooms(Math.max(1, Number(initialStay.rooms)));
    }
  }, [initialStay]);

  // When Starting Date (checkIn) changes, automatically update checkOut based on durationDays
  const handleCheckInChange = (newCheckIn) => {
    setCheckIn(newCheckIn);
    const updatedCheckOut = addDaysToDate(newCheckIn, durationDays);
    setCheckOut(updatedCheckOut);
    if (formError) setFormError('');
  };

  // When Number of Days changes, automatically update checkOut
  const handleDurationChange = (newDays) => {
    const validDays = Math.max(1, parseInt(newDays, 10) || 1);
    setDurationDays(validDays);
    const updatedCheckOut = addDaysToDate(checkIn, validDays);
    setCheckOut(updatedCheckOut);
    if (formError) setFormError('');
  };

  // If user manually adjusts checkOut date, sync durationDays
  const handleCheckOutChange = (newCheckOut) => {
    setCheckOut(newCheckOut);
    const calculatedDays = getDaysBetween(checkIn, newCheckOut);
    setDurationDays(Math.max(1, calculatedDays));
    if (formError) setFormError('');
  };

  // Room Occupancy Policy: Max 2 adults and 1 child per room
  const parsedRooms = Math.max(1, Number(rooms) || 1);
  const parsedAdults = Math.max(1, Number(adults) || 1);
  const parsedChildren = Math.max(0, Number(children) || 0);
  const totalGuests = parsedAdults + parsedChildren;

  const capacityInfo = checkRoomCapacity(parsedRooms, parsedAdults, parsedChildren);
  const { isOverCapacity, requiredRooms, maxAdults, maxChildren, reason } = capacityInfo;

  // Calculations for Exact Budget (Student Modification #2)
  const pricePerNight = hotel?.price || 0;
  const subtotal = pricePerNight * durationDays * parsedRooms;
  const serviceFee = 500; // Transparent fixed service fee
  const totalBudget = subtotal + serviceFee;
  const suggestedBudget = (pricePerNight * durationDays * requiredRooms) + serviceFee;

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hotel) {
      setFormError('Hotel information is missing.');
      return;
    }

    if (!guestName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setFormError('Please enter a valid email address (e.g. traveler@example.com).');
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      setFormError('Please enter a valid phone number (minimum 8 digits).');
      return;
    }

    if (!checkIn) {
      setFormError('Starting date is required.');
      return;
    }

    if (durationDays < 1) {
      setFormError('Please choose at least 1 day for your stay.');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setFormError('Check-out date must be strictly after the starting date.');
      return;
    }

    // Enforce hotel room capacity rule
    if (isOverCapacity) {
      setFormError(`Room capacity exceeded: Each room accommodates at most 2 adults and 1 child. For your party (${parsedAdults} adults, ${parsedChildren} children), please book at least ${requiredRooms} rooms.`);
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        hotelId: hotel.id,
        guestName: guestName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        checkIn,
        checkOut,
        guests: totalGuests,
        adults: parsedAdults,
        children: parsedChildren,
        rooms: parsedRooms,
        durationDays
      };

      const newBooking = await createBooking(payload);

      // Store in session storage
      try {
        const sessionBookings = JSON.parse(sessionStorage.getItem('staywise_session_bookings') || '[]');
        sessionBookings.push(newBooking.id);
        sessionStorage.setItem('staywise_session_bookings', JSON.stringify(sessionBookings));
      } catch (err) {
        // fallback gracefully
      }

      onBookingSuccess(newBooking);
    } catch (err) {
      console.error('Booking submission error:', err);
      setFormError(err.message || 'Booking could not be completed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-layout-grid">
      {/* Left Column: Guest & Stay Information Form */}
      <div className="booking-form-card">
        <div className="form-card-header">
          <h2 className="form-title">Reserve Your Stay</h2>
          <p className="form-subtitle">
            Select your starting date and stay duration to review your exact budget for {hotel?.name}.
          </p>
        </div>

        {formError && (
          <div className="form-alert-danger">
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="booking-actual-form">
          {/* Guest Information Section */}
          <div className="form-section-title">
            <span>👤 Guest Information</span>
          </div>

          <div className="form-group">
            <label htmlFor="guestName" className="form-label">
              Full Name <span className="req">*</span>
            </label>
            <input
              id="guestName"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              className="form-control"
              autoFocus
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="req">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="e.g. rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number <span className="req">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="form-control"
              />
            </div>
          </div>

          {/* Stay & Duration Section */}
          <div className="form-section-title" style={{ marginTop: '1.5rem' }}>
            <span>📅 Stay Dates & Duration</span>
            <span className="section-subtitle-badge">Live Budget Calculation</span>
          </div>

          {/* Starting Date & Duration */}
          <div className="form-row-2">
            {/* 1. Starting Date Picker */}
            <div className="form-group">
              <label htmlFor="checkIn" className="form-label">
                Starting Date (Check-in) <span className="req">*</span>
              </label>
              <input
                id="checkIn"
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => handleCheckInChange(e.target.value)}
                required
                className="form-control date-input-highlight"
              />
              <span className="field-hint">
                🗓️ {formatHumanDate(checkIn)}
              </span>
            </div>

            {/* 2. Number of Days Stepper & Input */}
            <div className="form-group">
              <label htmlFor="durationDays" className="form-label">
                Number of Days <span className="req">*</span>
                <span className="badge-days-counter">{durationDays} {durationDays === 1 ? 'Day' : 'Days'}</span>
              </label>
              <div className="duration-stepper-container">
                <button
                  type="button"
                  className="duration-step-btn"
                  onClick={() => handleDurationChange(durationDays - 1)}
                  disabled={durationDays <= 1}
                  aria-label="Decrease days"
                >
                  −
                </button>
                <input
                  id="durationDays"
                  type="number"
                  min="1"
                  max="60"
                  value={durationDays}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="duration-step-input"
                  required
                />
                <button
                  type="button"
                  className="duration-step-btn"
                  onClick={() => handleDurationChange(durationDays + 1)}
                  aria-label="Increase days"
                >
                  +
                </button>
              </div>
              <span className="field-hint">
                {durationDays} {durationDays === 1 ? 'night' : 'nights'} stay
              </span>
            </div>
          </div>

          {/* Quick Preset Days Buttons */}
          <div className="quick-days-presets">
            <span className="quick-days-label">Quick Select Days:</span>
            <div className="quick-days-pills">
              {PRESET_DAYS.map((days) => (
                <button
                  key={days}
                  type="button"
                  className={`quick-day-pill ${durationDays === days ? 'active' : ''}`}
                  onClick={() => handleDurationChange(days)}
                >
                  {days === 7 ? '7 Days (1 Wk)' : days === 14 ? '14 Days (2 Wks)' : `${days} ${days === 1 ? 'Day' : 'Days'}`}
                </button>
              ))}
            </div>
          </div>

          {/* Check-out Date */}
          <div className="checkout-display-box">
            <div className="checkout-info-left">
              <span className="checkout-badge">Check-out Date</span>
              <h4 className="checkout-date-text">
                {formatHumanDate(checkOut)}
              </h4>
              <p className="checkout-sub-text">
                {durationDays} {durationDays === 1 ? 'day' : 'days'} stay starting {formatHumanDate(checkIn)}
              </p>
            </div>
            <div className="checkout-manual-toggle">
              <label htmlFor="checkOut" className="checkout-manual-label">Edit directly:</label>
              <input
                id="checkOut"
                type="date"
                min={addDaysToDate(checkIn, 1)}
                value={checkOut}
                onChange={(e) => handleCheckOutChange(e.target.value)}
                className="checkout-date-mini"
              />
            </div>
          </div>

          {/* Room Occupancy & Capacity Enforcement Section */}
          <div className="room-occupancy-policy-box">
            <div className="room-occupancy-header">
              <span className="room-occupancy-title">
                👥 Guests & Room Configuration
              </span>
              <span className="room-policy-tag">
                🏨 Policy: Max 2 Adults + 1 Child per Room
              </span>
            </div>

            <div className="room-occupancy-grid">
              {/* Adults Selector */}
              <div className="occupancy-field">
                <label htmlFor="adults-select" className="occupancy-field-label">
                  <span>Adults <span className="req">*</span></span>
                  <span className="occupancy-subhint">Age 13+</span>
                </label>
                <select
                  id="adults-select"
                  value={adults}
                  onChange={(e) => {
                    setAdults(Number(e.target.value));
                    if (formError) setFormError('');
                  }}
                  className="occupancy-field-input"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Adult' : 'Adults'}
                    </option>
                  ))}
                </select>
                <span className="occupancy-field-note">Max 2 per room</span>
              </div>

              {/* Children Selector */}
              <div className="occupancy-field">
                <label htmlFor="children-select" className="occupancy-field-label">
                  <span>Children</span>
                  <span className="occupancy-subhint">Age 0–12</span>
                </label>
                <select
                  id="children-select"
                  value={children}
                  onChange={(e) => {
                    setChildren(Number(e.target.value));
                    if (formError) setFormError('');
                  }}
                  className="occupancy-field-input"
                >
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Child' : 'Children'}
                    </option>
                  ))}
                </select>
                <span className="occupancy-field-note">Max 1 per room</span>
              </div>

              {/* Number of Rooms */}
              <div className="occupancy-field">
                <label htmlFor="rooms-select" className="occupancy-field-label">
                  <span>Rooms <span className="req">*</span></span>
                  <span className="occupancy-subhint">{parsedRooms} Selected</span>
                </label>
                <select
                  id="rooms-select"
                  value={rooms}
                  onChange={(e) => {
                    setRooms(Number(e.target.value));
                    if (formError) setFormError('');
                  }}
                  className="occupancy-field-input"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Room' : 'Rooms'}
                    </option>
                  ))}
                </select>
                <span className="occupancy-field-note">
                  Capacity: {parsedRooms * 2} adults, {parsedRooms * 1} child
                </span>
              </div>
            </div>

            {/* Room Capacity Alert: Prominently asks user to book extra room if capacity exceeded */}
            {isOverCapacity && (
              <div className="capacity-warning-banner" role="alert">
                <div className="capacity-warning-icon">⚠️</div>
                <div className="capacity-warning-body">
                  <h4 className="capacity-warning-title">
                    Additional Room Required
                  </h4>
                  <p className="capacity-warning-text">
                    Standard hotel policy: <strong>Each room accommodates a maximum of 2 adults and 1 child</strong>. {reason}
                  </p>
                  <div className="capacity-warning-actions">
                    <button
                      type="button"
                      className="btn-capacity-fix"
                      onClick={() => {
                        setRooms(requiredRooms);
                        if (formError) setFormError('');
                      }}
                    >
                      ➕ Book {requiredRooms} Rooms for Your Party (₹{suggestedBudget.toLocaleString('en-IN')})
                    </button>
                    <span className="capacity-warning-badge-rule">
                      Need {requiredRooms} {requiredRooms === 1 ? 'room' : 'rooms'} for {parsedAdults} adults + {parsedChildren} {parsedChildren === 1 ? 'child' : 'children'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Verified Room Capacity Reassurance */}
            {!isOverCapacity && (
              <div className="capacity-success-badge">
                <span>✓ Room capacity verified: {parsedRooms} {parsedRooms === 1 ? 'room' : 'rooms'} comfortably accommodate your party of {parsedAdults} {parsedAdults === 1 ? 'adult' : 'adults'}{parsedChildren > 0 ? ` and ${parsedChildren} ${parsedChildren === 1 ? 'child' : 'children'}` : ''} (up to {maxAdults} adults and {maxChildren} {maxChildren === 1 ? 'child' : 'children'}).</span>
              </div>
            )}
          </div>

          {/* Streamlined Live Budget Bar */}
          <div className="booking-form-budget-strip">
            <div className="strip-info">
              <span className="strip-title">Exact Stay Budget</span>
              <span className="strip-formula">
                ₹{hotel.price.toLocaleString('en-IN')} × {durationDays} {durationDays === 1 ? 'night' : 'nights'} × {parsedRooms} {parsedRooms === 1 ? 'room' : 'rooms'} + ₹{serviceFee} fee
              </span>
            </div>
            <div className="strip-total">
              <span className="strip-amount">₹{totalBudget.toLocaleString('en-IN')}</span>
              <span className="strip-note">All taxes included</span>
            </div>
          </div>

          <div className="form-submit-row">
            <button
              type="submit"
              disabled={isSubmitting || durationDays <= 0}
              className={`btn btn-primary btn-lg btn-block ${isOverCapacity ? 'btn-capacity-pending' : ''}`}
            >
              {isSubmitting
                ? 'Confirming Reservation...'
                : isOverCapacity
                ? `⚠️ Book ${requiredRooms} Rooms to Confirm (₹${suggestedBudget.toLocaleString('en-IN')})`
                : `Confirm Booking for ${durationDays} ${durationDays === 1 ? 'Day' : 'Days'} (₹${totalBudget.toLocaleString('en-IN')})`}
            </button>
            <span className="form-academic-note">
              Instant Reservation — Best Price Guarantee & Free Cancellation.
            </span>
          </div>
        </form>
      </div>

      {/* Right Column: Live Booking Price Calculator Summary */}
      <div className="booking-summary-col">
        <BookingSummary
          hotel={hotel}
          checkIn={checkIn}
          checkOut={checkOut}
          days={durationDays}
          nights={durationDays}
          rooms={parsedRooms}
          guests={totalGuests}
          adults={parsedAdults}
          children={parsedChildren}
          subtotal={subtotal}
          serviceFee={serviceFee}
          total={totalBudget}
        />
      </div>
    </div>
  );
};

export default BookingForm;

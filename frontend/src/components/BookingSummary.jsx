import React from 'react';
import { formatHumanDate } from '../utils/dateUtils';
import { checkRoomCapacity } from '../utils/occupancyUtils';

/**
 * Student Modification #2: Smart Booking Price Calculator Summary
 * Dynamically computes and displays Subtotal, Service Fee, and Grand Total Budget.
 * Refined 2026 Minimalist Luxury Aesthetic (Uncluttered, High-Clarity).
 */
const BookingSummary = ({
  hotel,
  checkIn,
  checkOut,
  days = 1,
  nights = 1,
  rooms = 1,
  guests = 2,
  adults,
  children = 0,
  subtotal,
  serviceFee = 500,
  total
}) => {
  if (!hotel) return null;

  const stayNights = days || nights || 1;
  const parsedRooms = Math.max(1, Number(rooms) || 1);
  const parsedAdults = adults !== undefined ? Number(adults) : (guests <= 2 ? guests : 2);
  const parsedChildren = Number(children) || 0;

  // Real capacity check based on hotel policy (Max 2 adults + 1 child per room)
  const capacityInfo = checkRoomCapacity(parsedRooms, parsedAdults, parsedChildren);
  const { isOverCapacity, requiredRooms } = capacityInfo;

  return (
    <div className="booking-summary-card">
      {/* Sleek Header */}
      <div className="summary-card-header">
        <h3 className="summary-title">Stay Summary</h3>
        <span className="summary-live-tag">Live Budget</span>
      </div>

      {/* Hotel Preview (Single clean lockup, no text repetition) */}
      <div className="summary-hotel-lockup">
        <img
          src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'}
          alt=""
          className="summary-hotel-img"
        />
        <div className="summary-hotel-meta">
          <h4 className="summary-hotel-name">{hotel.name}</h4>
          <p className="summary-hotel-sub">
            📍 {hotel.location} · {hotel.roomType || 'Deluxe Room'}
          </p>
        </div>
      </div>

      {/* Trip Overview: Dates & Occupancy (Clean 2-block layout) */}
      <div className="summary-specs-group">
        {/* Dates Row */}
        <div className="summary-spec-item">
          <div className="spec-item-left">
            <span className="spec-item-label">Trip Dates</span>
            <span className="spec-item-duration">{stayNights} {stayNights === 1 ? 'Night' : 'Nights'}</span>
          </div>
          <div className="spec-item-right">
            <span className="spec-date-range">
              {formatHumanDate(checkIn) || checkIn || '—'} → {formatHumanDate(checkOut) || checkOut || '—'}
            </span>
          </div>
        </div>

        {/* Occupancy Row */}
        <div className="summary-spec-item">
          <div className="spec-item-left">
            <span className="spec-item-label">Occupancy</span>
            {isOverCapacity ? (
              <span className="spec-policy-warn">⚠️ Need {requiredRooms} rooms</span>
            ) : (
              <span className="spec-policy-ok">✓ Max 2A + 1C / rm</span>
            )}
          </div>
          <div className="spec-item-right">
            <span className="spec-guests-summary">
              <strong>{parsedRooms}</strong> {parsedRooms === 1 ? 'Room' : 'Rooms'} ·{' '}
              <strong>{parsedAdults}</strong> {parsedAdults === 1 ? 'Adult' : 'Adults'}
              {parsedChildren > 0 && <>, <strong>{parsedChildren}</strong> {parsedChildren === 1 ? 'Child' : 'Children'}</>}
            </span>
          </div>
        </div>
      </div>

      {/* Transparent Price Math (Student Modification #2) */}
      <div className="summary-pricing-list">
        <div className="pricing-row">
          <span className="pricing-label">
            ₹{hotel.price.toLocaleString('en-IN')} × {stayNights} {stayNights === 1 ? 'night' : 'nights'}{parsedRooms > 1 ? ` × ${parsedRooms} rooms` : ''}
          </span>
          <span className="pricing-val">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="pricing-row">
          <span className="pricing-label">Taxes & service fee</span>
          <span className="pricing-val">₹{serviceFee.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Grand Total Box */}
      <div className="summary-total-banner-clean">
        <div className="total-left">
          <span className="total-label-text">Total Stay Budget</span>
          <span className="total-taxes-note">All taxes & fees included</span>
        </div>
        <div className="total-right">
          <span className="total-figure">₹{total.toLocaleString('en-IN')}</span>
          <span className="total-daily-rate">₹{Math.round(total / stayNights).toLocaleString('en-IN')} / night</span>
        </div>
      </div>

      {/* Minimal Footer Perks */}
      <div className="summary-perks-minimal">
        <span>✓ Instant Confirmation</span>
        <span className="dot-sep">•</span>
        <span>Best Price Guarantee</span>
        <span className="dot-sep">•</span>
        <span>Free Cancellation</span>
      </div>
    </div>
  );
};

export default BookingSummary;

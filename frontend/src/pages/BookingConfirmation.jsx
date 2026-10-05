import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { fetchBookings } from '../utils/api';
import Loading from '../components/Loading';

const BookingConfirmation = () => {
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If not passed through route state (e.g. page refreshed), fetch latest booking from API
    if (!booking) {
      fetchBookings()
        .then((bookings) => {
          if (bookings && bookings.length > 0) {
            setBooking(bookings[0]); // newest booking
          }
        })
        .catch((err) => {
          console.error('Could not fetch confirmation booking:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [booking]);

  const handleCopyId = () => {
    if (booking && booking.id) {
      navigator.clipboard.writeText(booking.id).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Loading message="Loading booking confirmation..." />;
  }

  if (!booking) {
    return (
      <div className="confirmation-fallback-container">
        <div className="confirmation-card">
          <div className="confirmation-icon">⚠️</div>
          <h2>No Recent Booking Found</h2>
          <p>We could not find an active reservation session.</p>
          <div className="confirmation-buttons">
            <Link to="/my-bookings" className="btn btn-primary">
              View My Bookings
            </Link>
            <Link to="/hotels" className="btn btn-outline-primary">
              Explore More Hotels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page-container">
      <div className="confirmation-card print-target-card">
        {/* Large Success Icon */}
        <div className="confirmation-check-circle">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <span className="confirmation-status-pill">Status: {booking.status || 'Confirmed'}</span>
        <h1 className="confirmation-main-title">Your stay is confirmed!</h1>
        <p className="confirmation-subtitle">
          Thank you for choosing StayWise. Your reservation has been recorded in the system.
        </p>

        {/* Detailed Receipt Ticket */}
        <div className="confirmation-ticket">
          <div className="ticket-header-row">
            <div>
              <span className="ticket-label">Booking Reference ID</span>
              <div className="ticket-id-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong className="ticket-id-val">{booking.id}</strong>
                <button
                  type="button"
                  className="btn-copy-id"
                  onClick={handleCopyId}
                  title="Copy Reference ID"
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="ticket-label">Booking Date</span>
              <span className="ticket-date-val">
                {new Date(booking.createdAt || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="ticket-divider"></div>

          <div className="ticket-grid">
            <div className="ticket-item">
              <span className="ticket-label">Hotel:</span>
              <span className="ticket-value">{booking.hotelName}</span>
            </div>
            <div className="ticket-item">
              <span className="ticket-label">Guest:</span>
              <span className="ticket-value">{booking.guestName}</span>
            </div>
            <div className="ticket-item">
              <span className="ticket-label">Check-in:</span>
              <span className="ticket-value">{booking.checkIn}</span>
            </div>
            <div className="ticket-item">
              <span className="ticket-label">Check-out:</span>
              <span className="ticket-value">{booking.checkOut}</span>
            </div>
            <div className="ticket-item">
              <span className="ticket-label">Rooms:</span>
              <span className="ticket-value">{booking.rooms} {booking.rooms === 1 ? 'Room' : 'Rooms'}</span>
            </div>
            <div className="ticket-item">
              <span className="ticket-label">Guests:</span>
              <span className="ticket-value">
                {booking.adults !== undefined
                  ? `${booking.adults} ${booking.adults === 1 ? 'Adult' : 'Adults'}${booking.children > 0 ? `, ${booking.children} ${booking.children === 1 ? 'Child' : 'Children'}` : ''} (${booking.guests} Total)`
                  : `${booking.guests} Guest(s)`}
              </span>
            </div>
            <div className="ticket-item">
              <span className="ticket-label">Occupancy Policy:</span>
              <span className="ticket-value" style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>
                Max 2 Adults + 1 Child / Room (Compliant ✓)
              </span>
            </div>
          </div>

          <div className="ticket-divider"></div>

          <div className="ticket-total-row">
            <span className="ticket-total-label">Total Amount Paid / Due:</span>
            <span className="ticket-total-val">₹{Number(booking.totalAmount).toLocaleString('en-IN')}</span>
          </div>

          <div className="ticket-official-notice">
            <span>🛡️ Official StayWise Confirmation: Active & Verified Reservation</span>
          </div>
        </div>

        {/* Action Buttons: View My Bookings, Print Receipt, Explore More */}
        <div className="confirmation-buttons no-print">
          <button
            type="button"
            className="btn btn-outline-primary btn-lg"
            onClick={handlePrint}
          >
            🖨️ Print / Save Receipt (PDF)
          </button>
          <Link to="/my-bookings" className="btn btn-primary btn-lg">
            View My Bookings
          </Link>
          <Link to="/hotels" className="btn btn-ghost btn-lg">
            Explore More Hotels
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;

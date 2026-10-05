import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBookings, cancelBooking, clearAllBookings, createBooking } from '../utils/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'current'
  const [copiedId, setCopiedId] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Unable to load bookings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const getSessionBookingIds = () => {
    try {
      return JSON.parse(sessionStorage.getItem('staywise_session_bookings') || '[]');
    } catch (e) {
      return [];
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${bookingId}?`)) return;
    try {
      await cancelBooking(bookingId);
      // Remove from session storage if present
      const sessionIds = getSessionBookingIds().filter((id) => id !== bookingId);
      sessionStorage.setItem('staywise_session_bookings', JSON.stringify(sessionIds));
      setActionMessage(`Booking ${bookingId} was successfully cancelled.`);
      setTimeout(() => setActionMessage(''), 4000);
      loadBookings();
    } catch (err) {
      alert('Failed to cancel booking: ' + err.message);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all reservation history?')) return;
    try {
      await clearAllBookings();
      sessionStorage.removeItem('staywise_session_bookings');
      setActionMessage('All reservation history has been cleared.');
      setTimeout(() => setActionMessage(''), 4000);
      loadBookings();
    } catch (err) {
      alert('Failed to clear bookings: ' + err.message);
    }
  };

  const handleLoadSampleBookings = async () => {
    try {
      setLoading(true);
      await createBooking({
        hotelId: 'hotel-1',
        guestName: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        checkIn: '2026-10-15',
        checkOut: '2026-10-18',
        guests: 2,
        rooms: 1
      });
      await createBooking({
        hotelId: 'hotel-31',
        guestName: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '+91 98234 56789',
        checkIn: '2026-11-02',
        checkOut: '2026-11-04',
        guests: 2,
        rooms: 1
      });
      setActionMessage('Sample reservations loaded successfully.');
      setTimeout(() => setActionMessage(''), 4000);
      loadBookings();
    } catch (err) {
      alert('Unable to load sample bookings: ' + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading your bookings..." />;
  }

  if (error) {
    return (
      <div className="section-padding">
        <ErrorMessage message={error} onRetry={loadBookings} />
      </div>
    );
  }

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handlePrintBooking = (booking) => {
    window.print();
  };

  const sessionIds = getSessionBookingIds();
  const displayedBookings =
    filterMode === 'current' && sessionIds.length > 0
      ? bookings.filter((b) => sessionIds.includes(b.id))
      : bookings;

  const totalSpent = displayedBookings.reduce(
    (sum, b) => sum + (Number(b.totalAmount) || 0),
    0
  );

  return (
    <div className="bookings-page-container">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="page-header-content">
          <span className="page-header-badge">Reservation History</span>
          <h1 className="page-header-title">My Bookings</h1>
          <p className="page-header-desc">
            Review your confirmed hotel stays registered in the StayWise system.
          </p>
        </div>
      </div>

      <div className="bookings-content-container">
        {actionMessage && (
          <div className="status-banner status-banner-success" style={{ marginBottom: '1.25rem' }}>
            ✓ {actionMessage}
          </div>
        )}

        {displayedBookings.length === 0 ? (
          <div className="bookings-empty-card">
            <div className="empty-icon">🧳</div>
            <h2 className="empty-title">
              {filterMode === 'current' && sessionIds.length === 0 && bookings.length > 0
                ? 'No bookings in current session.'
                : 'No bookings yet.'}
            </h2>
            <p className="empty-desc">
              {filterMode === 'current' && sessionIds.length === 0 && bookings.length > 0 ? (
                <>
                  You haven't made a booking during this session.{' '}
                  <button
                    onClick={() => setFilterMode('all')}
                    className="btn-text-primary"
                    style={{ textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: '#2563eb', fontWeight: 600 }}
                  >
                    View all past bookings ({bookings.length})
                  </button>
                </>
              ) : (
                "You haven't reserved any stays yet. Explore our hotel catalog to confirm your first stay!"
              )}
            </p>
            <div className="empty-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/hotels" className="btn btn-primary btn-md">
                Explore Hotels
              </Link>
              <button
                type="button"
                className="btn btn-outline-primary btn-md"
                onClick={handleLoadSampleBookings}
              >
                ✨ Load Demo Reservations
              </button>
              {bookings.length > 0 && filterMode === 'current' && (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-md"
                  onClick={() => setFilterMode('all')}
                >
                  Show All
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bookings-list">
            <div className="bookings-meta-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span>
                  Confirmed Bookings
                </span>
                <span className="bookings-total-pill" style={{ background: '#ecfdf5', color: '#065f46', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #a7f3d0' }}>
                  Total: ₹{totalSpent.toLocaleString('en-IN')}
                </span>
                {sessionIds.length > 0 && (
                  <div className="filter-pill-group" style={{ display: 'inline-flex', gap: '0.25rem', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
                    <button
                      type="button"
                      className={`btn-xs ${filterMode === 'current' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => setFilterMode('current')}
                    >
                      Current Session
                    </button>
                    <button
                      type="button"
                      className={`btn-xs ${filterMode === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => setFilterMode('all')}
                    >
                      All Bookings
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-xs"
                  onClick={loadBookings}
                >
                  ↻ Refresh
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-xs"
                  onClick={handleClearAll}
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>

            <div className="bookings-grid-cards">
              {displayedBookings.map((booking) => (
                <div key={booking.id} className="booking-card-item">
                  <div className="booking-card-top">
                    <div className="booking-hotel-info">
                      <img
                        src={booking.hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'}
                        alt={booking.hotelName}
                        className="booking-card-thumbnail"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                      <div>
                        <div className="booking-id-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>Booking ID: <strong>{booking.id}</strong></span>
                          <button
                            type="button"
                            className="btn-copy-id"
                            onClick={() => handleCopyId(booking.id)}
                            title="Copy Booking ID"
                            style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}
                          >
                            {copiedId === booking.id ? '✓ Copied' : '📋'}
                          </button>
                        </div>
                        <h3 className="booking-card-hotel-name">
                          <Link to={`/hotels/${booking.hotelId}`}>{booking.hotelName}</Link>
                        </h3>
                        <p className="booking-card-loc">📍 {booking.hotelLocation}</p>
                      </div>
                    </div>

                    <div className="booking-status-box">
                      <span className="badge-confirmed">
                        ● {booking.status || 'Confirmed'}
                      </span>
                    </div>
                  </div>

                  <div className="booking-card-divider"></div>

                  <div className="booking-card-details-grid">
                    <div className="detail-unit">
                      <span className="unit-label">Guest Name:</span>
                      <strong className="unit-val">{booking.guestName}</strong>
                    </div>

                    <div className="detail-unit">
                      <span className="unit-label">Check-in:</span>
                      <span className="unit-val">📅 {booking.checkIn}</span>
                    </div>

                    <div className="detail-unit">
                      <span className="unit-label">Check-out:</span>
                      <span className="unit-val">📅 {booking.checkOut} ({booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'})</span>
                    </div>

                    <div className="detail-unit">
                      <span className="unit-label">Rooms & Guests:</span>
                      <span className="unit-val">
                        🚪 {booking.rooms} {booking.rooms === 1 ? 'Room' : 'Rooms'} • 👥 {booking.adults !== undefined ? `${booking.adults} Adult(s)${booking.children > 0 ? `, ${booking.children} Child(ren)` : ''}` : `${booking.guests} Guest(s)`}
                      </span>
                    </div>

                    <div className="detail-unit unit-total">
                      <span className="unit-label">Total Amount:</span>
                      <strong className="unit-val-price">₹{Number(booking.totalAmount).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="booking-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/hotels/${booking.hotelId}`} className="btn btn-outline-primary btn-sm">
                        View Hotel Details
                      </Link>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handlePrintBooking(booking)}
                        title="Print or Save Receipt as PDF"
                      >
                        🖨️ Receipt
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn btn-text-danger btn-sm"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel Reservation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

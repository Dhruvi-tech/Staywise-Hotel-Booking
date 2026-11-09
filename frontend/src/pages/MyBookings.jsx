import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBookings, cancelBooking, modifyBooking } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const MyBookings = () => {
  const { isAuthenticated, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'confirmed', 'cancelled'
  const [copiedId, setCopiedId] = useState(null);

  // Modification modal state
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({ checkIn: '', checkOut: '', rooms: 1, guests: 2 });
  const [modifying, setModifying] = useState(false);
  const [modifyError, setModifyError] = useState('');

  // Invoice modal state
  const [activeInvoice, setActiveInvoice] = useState(null);

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
  }, [isAuthenticated]);

  const handleCancel = async (booking) => {
    const bId = booking._id || booking.id;
    const ref = booking.bookingReference || booking.id;

    const reason = window.prompt(
      `Please state a reason for cancelling reservation ${ref} (optional):`,
      'Change in travel plans'
    );
    if (reason === null) return; // User cancelled prompt

    try {
      await cancelBooking(bId, reason);
      setActionMessage(`Reservation ${ref} was successfully cancelled.`);
      setTimeout(() => setActionMessage(''), 4500);
      loadBookings();
    } catch (err) {
      alert('Failed to cancel booking: ' + err.message);
    }
  };

  const openModifyModal = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      checkIn: booking.checkIn || '',
      checkOut: booking.checkOut || '',
      rooms: booking.rooms || 1,
      guests: booking.guests || 2
    });
    setModifyError('');
  };

  const handleModifySubmit = async (e) => {
    e.preventDefault();
    setModifying(true);
    setModifyError('');

    try {
      const bId = editingBooking._id || editingBooking.id;
      await modifyBooking(bId, editForm);
      setActionMessage(`Reservation ${editingBooking.bookingReference || bId} was successfully modified.`);
      setTimeout(() => setActionMessage(''), 4500);
      setEditingBooking(null);
      loadBookings();
    } catch (err) {
      setModifyError(err.message || 'Failed to modify reservation.');
    } finally {
      setModifying(false);
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Loading message="Loading your verified bookings..." />;
  }

  if (!isAuthenticated && bookings.length === 0) {
    return (
      <div className="bookings-page-container">
        <div className="page-header-banner">
          <div className="page-header-content">
            <span className="page-header-badge">Guest Portal</span>
            <h1 className="page-header-title">My Bookings</h1>
            <p className="page-header-desc">
              Sign in to view your verified hotel reservations recorded in the StayWise database.
            </p>
          </div>
        </div>

        <div className="bookings-content-container" style={{ padding: '3rem 1rem' }}>
          <div className="bookings-empty-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
            <div className="empty-icon">🔐</div>
            <h2 className="empty-title">Sign In Required</h2>
            <p className="empty-desc">
              Your reservations are secured with your account credentials. Please sign in to view and manage your stays.
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-primary">
                Sign In
              </Link>
              <Link to="/hotels" className="btn btn-outline-primary">
                Explore Hotels
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-padding">
        <ErrorMessage message={error} onRetry={loadBookings} />
      </div>
    );
  }

  const displayedBookings = bookings.filter((b) => {
    if (filterMode === 'confirmed') return b.status === 'Confirmed';
    if (filterMode === 'cancelled') return b.status === 'Cancelled';
    return true;
  });

  const totalSpent = displayedBookings
    .filter((b) => b.status === 'Confirmed')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  return (
    <div className="bookings-page-container">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="page-header-content">
          <span className="page-header-badge">Reservation History</span>
          <h1 className="page-header-title">My Bookings</h1>
          <p className="page-header-desc">
            Review your confirmed hotel stays registered in the StayWise central system.
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
              {filterMode !== 'all' ? `No ${filterMode} bookings found.` : 'No bookings yet.'}
            </h2>
            <p className="empty-desc">
              You haven't reserved any stays yet. Explore our hotel catalog to confirm your first stay!
            </p>
            <div className="empty-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/hotels" className="btn btn-primary btn-md">
                Explore Hotels
              </Link>
              {filterMode !== 'all' && (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-md"
                  onClick={() => setFilterMode('all')}
                >
                  Show All Bookings
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bookings-list">
            <div className="bookings-meta-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600 }}>
                  Confirmed Stays ({bookings.filter((b) => b.status === 'Confirmed').length})
                </span>
                <span className="bookings-total-pill" style={{ background: '#ecfdf5', color: '#065f46', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #a7f3d0' }}>
                  Total: ₹{totalSpent.toLocaleString('en-IN')}
                </span>

                {/* Filter Tabs */}
                <div style={{ display: 'inline-flex', gap: '0.25rem', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
                  <button
                    type="button"
                    className={`btn-xs ${filterMode === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => setFilterMode('all')}
                  >
                    All ({bookings.length})
                  </button>
                  <button
                    type="button"
                    className={`btn-xs ${filterMode === 'confirmed' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => setFilterMode('confirmed')}
                  >
                    Confirmed
                  </button>
                  <button
                    type="button"
                    className={`btn-xs ${filterMode === 'cancelled' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => setFilterMode('cancelled')}
                  >
                    Cancelled
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-xs"
                  onClick={loadBookings}
                >
                  ↻ Refresh
                </button>
              </div>
            </div>

            <div className="bookings-grid-cards">
              {displayedBookings.map((booking) => {
                const bRef = booking.bookingReference || booking.id;
                const hotelTargetId = booking.hotelCustomId || booking.hotelId || (typeof booking.hotel === 'object' ? booking.hotel?.customId : booking.hotel);
                const isConfirmed = booking.status === 'Confirmed';

                return (
                  <div key={booking._id || booking.id} className="booking-card-item">
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
                            <span>Booking Reference: <strong>{bRef}</strong></span>
                            <button
                              type="button"
                              className="btn-copy-id"
                              onClick={() => handleCopyId(bRef)}
                              title="Copy Reference"
                              style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}
                            >
                              {copiedId === bRef ? '✓ Copied' : '📋'}
                            </button>
                          </div>
                          <h3 className="booking-card-hotel-name">
                            <Link to={`/hotels/${hotelTargetId}`}>{booking.hotelName}</Link>
                          </h3>
                          <p className="booking-card-loc">📍 {booking.hotelLocation}</p>
                        </div>
                      </div>

                      <div className="booking-status-box">
                        <span style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: isConfirmed ? '#ecfdf5' : '#fff1f2',
                          color: isConfirmed ? '#059669' : '#e11d48',
                          border: `1px solid ${isConfirmed ? '#a7f3d0' : '#fecdd3'}`
                        }}>
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

                    <div className="booking-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Link to={`/hotels/${hotelTargetId}`} className="btn btn-outline-primary btn-sm">
                          View Hotel
                        </Link>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setActiveInvoice(booking)}
                          title="View Official Invoice"
                        >
                          🧾 Printable Invoice
                        </button>
                        <Link
                          to={`/verify-booking?ref=${encodeURIComponent(bRef)}`}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--accent-blue)' }}
                        >
                          🔍 Verify
                        </Link>
                      </div>

                      {isConfirmed && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openModifyModal(booking)}
                          >
                            ✏️ Modify
                          </button>
                          <button
                            type="button"
                            className="btn btn-text-danger btn-sm"
                            onClick={() => handleCancel(booking)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modification Modal */}
      {editingBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-floating)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem' }}>Modify Reservation</h3>
              <button onClick={() => setEditingBooking(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Ref: <strong>{editingBooking.bookingReference || editingBooking.id}</strong> ({editingBooking.hotelName})
            </p>

            {modifyError && (
              <div style={{ background: 'var(--accent-rose-light)', color: 'var(--accent-rose)', padding: '0.75rem', borderRadius: 'var(--radius-xs)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modifyError}
              </div>
            )}

            <form onSubmit={handleModifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>New Check-in Date</label>
                <input
                  type="date"
                  required
                  value={editForm.checkIn}
                  onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>New Check-out Date</label>
                <input
                  type="date"
                  required
                  value={editForm.checkOut}
                  onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Rooms</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={editForm.rooms}
                    onChange={(e) => setEditForm({ ...editForm, rooms: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Total Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={editForm.guests}
                    onChange={(e) => setEditForm({ ...editForm, guests: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingBooking(null)} className="btn btn-outline" style={{ padding: '0.55rem 1rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={modifying} className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
                  {modifying ? 'Recalculating...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {activeInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div style={{ maxWidth: '680px', width: '100%', background: '#fff', borderRadius: 'var(--radius-md)', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-strong)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-main)' }}>StayWise Hospitality</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Official Reservation Receipt & Tax Invoice</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem' }}>
                  {activeInvoice.bookingReference || activeInvoice.id}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Issued: {new Date(activeInvoice.createdAt || Date.now()).toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Billed To:</strong>
                <div>{activeInvoice.guestName}</div>
                <div>{activeInvoice.email}</div>
                <div>{activeInvoice.phone}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Property Details:</strong>
                <div style={{ fontWeight: 600 }}>{activeInvoice.hotelName}</div>
                <div>📍 {activeInvoice.hotelLocation}</div>
                <div>Schedule: {activeInvoice.checkIn} to {activeInvoice.checkOut} ({activeInvoice.nights} nights)</div>
              </div>
            </div>

            {/* Line items table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-strong)' }}>
                  <th style={{ padding: '0.65rem', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '0.65rem', textAlign: 'center' }}>Rate</th>
                  <th style={{ padding: '0.65rem', textAlign: 'center' }}>Nights × Rooms</th>
                  <th style={{ padding: '0.65rem', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.65rem' }}>{activeInvoice.hotelName} accommodation</td>
                  <td style={{ padding: '0.65rem', textAlign: 'center' }}>₹{(activeInvoice.pricePerNight || (activeInvoice.totalAmount - 500) / (activeInvoice.nights * activeInvoice.rooms)).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.65rem', textAlign: 'center' }}>{activeInvoice.nights}n × {activeInvoice.rooms}r</td>
                  <td style={{ padding: '0.65rem', textAlign: 'right' }}>₹{(activeInvoice.subtotal || activeInvoice.totalAmount - 500).toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.65rem' }}>Standard Hospitality Concierge & Service Fee</td>
                  <td style={{ padding: '0.65rem', textAlign: 'center' }}>₹500</td>
                  <td style={{ padding: '0.65rem', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '0.65rem', textAlign: 'right' }}>₹500</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ padding: '0.85rem 0.65rem', textAlign: 'right', fontWeight: 700, fontSize: '1rem' }}>Grand Total Paid:</td>
                  <td style={{ padding: '0.85rem 0.65rem', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: 'var(--emerald)' }}>
                    ₹{Number(activeInvoice.totalAmount).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Status: <strong style={{ color: activeInvoice.status === 'Confirmed' ? 'var(--emerald)' : 'var(--accent-rose)' }}>{activeInvoice.status}</strong> • Verified via StayWise Central Ledger
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  🖨️ Print / Save PDF
                </button>
                <button type="button" onClick={() => setActiveInvoice(null)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyBookings;

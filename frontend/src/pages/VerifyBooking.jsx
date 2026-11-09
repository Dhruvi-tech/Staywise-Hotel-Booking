import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyBookingReference } from '../utils/api';

const VerifyBooking = () => {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [reference, setReference] = useState(initialRef);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRef) {
      handleVerify(initialRef);
    }
  }, [initialRef]);

  const handleVerify = async (refCode) => {
    const code = (refCode || reference).trim();
    if (!code) {
      setError('Please enter a valid reservation reference.');
      return;
    }

    setLoading(true);
    setError('');
    setBookingData(null);

    try {
      const data = await verifyBookingReference(code);
      setBookingData(data);
    } catch (err) {
      setError(err.message || 'No reservation found matching this reference.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '720px', margin: '0 auto', minHeight: '80vh' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600 }}>
          Digital Cryptographic Verification
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginTop: '0.35rem', color: 'var(--text-main)' }}>
          Verify StayWise Reservation
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Instantly authenticate your booking credentials directly against the StayWise secure ledger.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="card" style={{ padding: '1.75rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', marginBottom: '2rem' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          style={{ display: 'flex', gap: '0.75rem' }}
        >
          <input
            type="text"
            placeholder="e.g. SW-BK-13876"
            value={reference}
            onChange={(e) => {
              setReference(e.target.value.toUpperCase());
              if (error) setError('');
            }}
            style={{
              flex: 1,
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              fontSize: '1rem',
              fontFamily: 'monospace',
              letterSpacing: '0.05em'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Verifying...' : 'Verify Now'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '1rem', background: 'var(--accent-rose-light)', borderLeft: '4px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-xs)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* Verified Certificate Card */}
      {bookingData && (
        <div className="card" style={{ background: '#fff', border: '2px solid var(--emerald)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ background: 'var(--emerald-light)', color: 'var(--emerald)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                ✓ Official StayWise Verified Reservation
              </span>
              <div style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-main)' }}>
                {bookingData.bookingReference}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: bookingData.status === 'Confirmed' ? 'var(--emerald)' : 'var(--accent-rose)' }}>
                {bookingData.status}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Property Name</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {bookingData.hotelName}
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>📍 {bookingData.hotelLocation}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Primary Guest</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {bookingData.guestName}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stay Schedule</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {bookingData.checkIn} → {bookingData.checkOut}
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {bookingData.nights} Night(s) • {bookingData.rooms} Room(s)
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Grand Total</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--emerald)', marginTop: '0.2rem' }}>
                ₹{bookingData.totalAmount.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Inclusive of ₹500 concierge service fee</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Verified via StayWise Central Database Ledger
            </span>
            <Link to="/hotels" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
              Explore More Hotels
            </Link>
          </div>

        </div>
      )}

    </div>
  );
};

export default VerifyBooking;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ImageGallery from '../components/ImageGallery';
import Rating from '../components/Rating';
import AmenityList from '../components/AmenityList';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchHotelById } from '../utils/api';
import { addToCompare, isInCompare, removeFromCompare } from '../utils/storage';
import {
  getTodayString,
  getFutureDateString,
  addDaysToDate,
  formatHumanDate
} from '../utils/dateUtils';
import { checkRoomCapacity } from '../utils/occupancyUtils';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompared, setIsCompared] = useState(false);
  const [compareMessage, setCompareMessage] = useState('');

  // Starting Date & Days Calculator State
  const [startDate, setStartDate] = useState(getFutureDateString(1));
  const [stayDays, setStayDays] = useState(2);
  const [stickyRooms, setStickyRooms] = useState(1);
  const [stickyAdults, setStickyAdults] = useState(2);
  const [stickyChildren, setStickyChildren] = useState(0);

  const loadHotel = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHotelById(id);
      setHotel(data);
      setIsCompared(isInCompare(data.id));
    } catch (err) {
      console.error('Error fetching hotel details:', err);
      setError('Unable to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotel();
    window.scrollTo(0, 0);
  }, [id]);

  const handleCompareToggle = () => {
    if (!hotel) return;

    if (isCompared) {
      removeFromCompare(hotel.id);
      setIsCompared(false);
      setCompareMessage('Removed from comparison list');
      setTimeout(() => setCompareMessage(''), 2500);
    } else {
      const result = addToCompare(hotel);
      if (result.success) {
        setIsCompared(true);
        setCompareMessage('Added to comparison! (Compare up to 3 hotels)');
        setTimeout(() => setCompareMessage(''), 2500);
      } else {
        setCompareMessage(result.message);
        setTimeout(() => setCompareMessage(''), 3000);
      }
    }
  };

  if (loading) {
    return <Loading message="Loading hotel details..." />;
  }

  if (error || !hotel) {
    return (
      <div className="section-padding">
        <ErrorMessage
          message={error || 'Unable to load hotels. Please try again.'}
          onRetry={loadHotel}
        />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/hotels" className="btn btn-primary">
            ← Back to Stays
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-details-page">
      {/* Breadcrumb Navigation */}
      <div className="details-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/hotels">Hotels</Link>
        <span>/</span>
        <Link to={`/hotels?location=${encodeURIComponent(hotel.location)}`}>{hotel.location}</Link>
        <span>/</span>
        <span className="current-crumb">{hotel.name}</span>
      </div>

      {/* Main Header Card */}
      <div className="details-header-card">
        <div className="details-header-info">
          <div className="details-badges-row">
            <span className="location-pill">📍 {hotel.location}</span>
            <Rating rating={hotel.rating} reviewsCount={hotel.reviewsCount} size="md" />
          </div>

          <h1 className="details-title">{hotel.name}</h1>
          <p className="details-address">{hotel.address || `Premier stay in ${hotel.location}`}</p>
        </div>

        <div className="details-header-pricing">
          <div className="price-tag-big">
            <span className="price-num">₹{hotel.price.toLocaleString('en-IN')}</span>
            <span className="price-unit"> / night</span>
          </div>
          <div className="details-quick-actions">
            <Link to={`/booking/${hotel.id}`} className="btn btn-primary btn-book-now">
              Book Your Stay
            </Link>
          </div>
        </div>
      </div>

      {/* Photo Section: 1 large + 3 supporting photos */}
      <div className="details-gallery-section">
        <ImageGallery images={hotel.images} hotelName={hotel.name} />
      </div>

      {/* Main Details Body */}
      <div className="details-content-grid">
        {/* Left Column: Description, Highlights, Amenities */}
        <div className="details-main-col">
          {/* About Stay */}
          <div className="details-card">
            <h2 className="card-section-title">About this stay</h2>
            <p className="details-tagline">{hotel.tagline}</p>
            <p className="details-body-text">{hotel.description}</p>
          </div>

          {/* Stay Highlights */}
          <div className="details-card">
            <h2 className="card-section-title">Stay Highlights</h2>
            <div className="highlights-grid">
              <div className="highlight-pill">
                <span className="hl-icon">📶</span>
                <span>Free High-Speed Wi-Fi</span>
              </div>
              <div className="highlight-pill">
                <span className="hl-icon">🍳</span>
                <span>Breakfast Included</span>
              </div>
              <div className="highlight-pill">
                <span className="hl-icon">🏊</span>
                <span>Swimming Pool Access</span>
              </div>
              <div className="highlight-pill">
                <span className="hl-icon">🚗</span>
                <span>Free On-Site Parking</span>
              </div>
              <div className="highlight-pill">
                <span className="hl-icon">❄️</span>
                <span>Air Conditioning</span>
              </div>
            </div>
          </div>

          {/* Amenities & Facilities */}
          <div className="details-card">
            <h2 className="card-section-title">Amenities & Facilities</h2>
            <AmenityList amenities={hotel.amenities} isCard={false} />
          </div>

          {/* Room Details */}
          <div className="details-card">
            <h2 className="card-section-title">Room Details</h2>
            <div className="room-spec-grid">
              <div className="room-spec-item">
                <span className="spec-label">Room Type:</span>
                <span className="spec-value">{hotel.roomType || 'Standard Deluxe Room'}</span>
              </div>
              <div className="room-spec-item">
                <span className="spec-label">Check-in:</span>
                <span className="spec-value">2:00 PM</span>
              </div>
              <div className="room-spec-item">
                <span className="spec-label">Check-out:</span>
                <span className="spec-value">11:00 AM</span>
              </div>
            </div>
          </div>

          {/* Hotel Policies & Verification */}
          <div className="details-card">
            <h2 className="card-section-title">Property Policies & Rules</h2>
            <div className="policies-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
              <div className="policy-box" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.2rem' }}>🪪 ID Proof Required</strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Govt-issued photo ID (Aadhaar/Passport/DL) required at check-in.</span>
              </div>
              <div className="policy-box" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.2rem' }}>🛡️ Flexible Cancellation</strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>100% free cancellation up to 24 hours prior to check-in.</span>
              </div>
              <div className="policy-box" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.2rem' }}>👶 Child Policy</strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Children up to 6 years stay free of charge with existing bedding.</span>
              </div>
              <div className="policy-box" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.2rem' }}>⚡ Instant Booking</strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Confirmed immediately via StayWise REST reservation engine.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar: Dynamic Budget & Reservation Card */}
        <div className="details-side-col">
          <div className="details-sticky-booking-card">
            <div className="sticky-price-display">
              <span className="sticky-price-val">₹{hotel.price.toLocaleString('en-IN')}</span>
              <span className="sticky-price-sub"> / night</span>
            </div>

            {/* Live Budget & Days Calculator */}
            <div className="sticky-budget-estimator">
              <div className="estimator-title-row">
                <span className="estimator-label">📅 Choose Dates & Duration</span>
                <span className="estimator-badge">Live Budget</span>
              </div>

              {/* 1. Starting Date */}
              <div className="estimator-field">
                <label htmlFor="details-start-date" className="estimator-field-label">Starting Date (Check-in)</label>
                <input
                  id="details-start-date"
                  type="date"
                  min={getTodayString()}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="estimator-date-input"
                />
                <span className="estimator-hint">🗓️ {formatHumanDate(startDate)}</span>
              </div>

              {/* 2. Number of Days Stepper */}
              <div className="estimator-field">
                <div className="estimator-field-header">
                  <label htmlFor="details-stay-days" className="estimator-field-label">Number of Days</label>
                  <span className="estimator-days-badge">{stayDays} {stayDays === 1 ? 'Day' : 'Days'}</span>
                </div>
                <div className="estimator-stepper">
                  <button
                    type="button"
                    onClick={() => setStayDays((d) => Math.max(1, d - 1))}
                    disabled={stayDays <= 1}
                    className="stepper-btn"
                    aria-label="Decrease days"
                  >
                    −
                  </button>
                  <input
                    id="details-stay-days"
                    type="number"
                    min="1"
                    max="60"
                    value={stayDays}
                    onChange={(e) => setStayDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="stepper-num"
                  />
                  <button
                    type="button"
                    onClick={() => setStayDays((d) => d + 1)}
                    className="stepper-btn"
                    aria-label="Increase days"
                  >
                    +
                  </button>
                </div>

                {/* Quick Day Chips */}
                <div className="estimator-chips">
                  {[1, 2, 3, 5, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`estimator-chip ${stayDays === num ? 'active' : ''}`}
                      onClick={() => setStayDays(num)}
                    >
                      {num === 7 ? '7D (1 Wk)' : `${num}D`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Check-out Date */}
              <div className="estimator-checkout-preview">
                <span className="checkout-preview-label">Check-out:</span>
                <strong className="checkout-preview-val">
                  {formatHumanDate(addDaysToDate(startDate, stayDays))}
                </strong>
              </div>

              {/* Occupancy Selection (Max 2 Adults + 1 Child per room) */}
              {(() => {
                const stickyCapacity = checkRoomCapacity(stickyRooms, stickyAdults, stickyChildren);
                const isStickyOverCapacity = stickyCapacity.isOverCapacity;
                const stickyRequiredRooms = stickyCapacity.requiredRooms;
                const stickySubtotal = (hotel?.price || 0) * stayDays * stickyRooms;
                const stickyTotal = stickySubtotal + 500;
                const stickySuggestedTotal = ((hotel?.price || 0) * stayDays * stickyRequiredRooms) + 500;

                return (
                  <>
                    <div className="sticky-occupancy-section">
                      <div className="sticky-occupancy-title-row">
                        <span className="sticky-occupancy-label">👥 Guests & Rooms</span>
                        <span className="sticky-occupancy-rule">Max 2 Adults + 1 Child / Room</span>
                      </div>

                      <div className="sticky-occupancy-controls">
                        <div className="sticky-occ-col">
                          <label className="sticky-occ-label" htmlFor="sticky-adults">Adults</label>
                          <select
                            id="sticky-adults"
                            value={stickyAdults}
                            onChange={(e) => setStickyAdults(Number(e.target.value))}
                            className="sticky-occ-select"
                          >
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sticky-occ-col">
                          <label className="sticky-occ-label" htmlFor="sticky-children">Children</label>
                          <select
                            id="sticky-children"
                            value={stickyChildren}
                            onChange={(e) => setStickyChildren(Number(e.target.value))}
                            className="sticky-occ-select"
                          >
                            {[0, 1, 2, 3].map((n) => (
                              <option key={n} value={n}>{n} {n === 1 ? 'Child' : 'Children'}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sticky-occ-col">
                          <label className="sticky-occ-label" htmlFor="sticky-rooms">Rooms</label>
                          <select
                            id="sticky-rooms"
                            value={stickyRooms}
                            onChange={(e) => setStickyRooms(Number(e.target.value))}
                            className="sticky-occ-select"
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>{n} {n === 1 ? 'Room' : 'Rooms'}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* If capacity exceeded: warn traveler and provide 1-click room upgrade */}
                      {isStickyOverCapacity && (
                        <div className="sticky-capacity-warning">
                          <p>
                            ⚠️ <strong>Extra room required:</strong> Each room accommodates max 2 adults and 1 child. For your party ({stickyAdults} adults{stickyChildren > 0 ? `, ${stickyChildren} children` : ''}), please book at least {stickyRequiredRooms} rooms.
                          </p>
                          <button
                            type="button"
                            className="sticky-capacity-btn"
                            onClick={() => setStickyRooms(stickyRequiredRooms)}
                          >
                            ➕ Book {stickyRequiredRooms} Rooms (₹{stickySuggestedTotal.toLocaleString('en-IN')})
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Exact Budget Banner */}
                    <div className="estimator-total-box">
                      <div className="total-box-top">
                        <span className="total-box-title">
                          Exact Budget ({stayDays} {stayDays === 1 ? 'Day' : 'Days'}, {stickyRooms} {stickyRooms === 1 ? 'Room' : 'Rooms'}):
                        </span>
                        <span className="total-box-calc">
                          ₹{hotel.price.toLocaleString('en-IN')} × {stayDays}d × {stickyRooms}rm + ₹500 fee
                        </span>
                      </div>
                      <div className="total-box-figure">
                        ₹{stickyTotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="sticky-action-buttons">
              {(() => {
                const stickyCapacity = checkRoomCapacity(stickyRooms, stickyAdults, stickyChildren);
                const isStickyOverCapacity = stickyCapacity.isOverCapacity;
                const stickyRequiredRooms = stickyCapacity.requiredRooms;
                const stickyTotal = ((hotel?.price || 0) * stayDays * stickyRooms) + 500;
                const stickySuggestedTotal = ((hotel?.price || 0) * stayDays * stickyRequiredRooms) + 500;

                return (
                  <button
                    type="button"
                    className="btn btn-primary btn-block btn-lg"
                    onClick={() => {
                      if (isStickyOverCapacity) {
                        setStickyRooms(stickyRequiredRooms);
                        return;
                      }
                      const calculatedCheckout = addDaysToDate(startDate, stayDays);
                      navigate(`/booking/${hotel.id}`, {
                        state: {
                          checkIn: startDate,
                          days: stayDays,
                          checkOut: calculatedCheckout,
                          guests: stickyAdults + stickyChildren,
                          adults: stickyAdults,
                          children: stickyChildren,
                          rooms: stickyRooms
                        }
                      });
                    }}
                  >
                    {isStickyOverCapacity
                      ? `⚠️ Book ${stickyRequiredRooms} Rooms (₹${stickySuggestedTotal.toLocaleString('en-IN')})`
                      : `Reserve for ${stayDays} ${stayDays === 1 ? 'Day' : 'Days'} (₹${stickyTotal.toLocaleString('en-IN')})`}
                  </button>
                );
              })()}

              <button
                type="button"
                className={`btn btn-block ${isCompared ? 'btn-compared' : 'btn-outline-primary'}`}
                onClick={handleCompareToggle}
              >
                {isCompared ? '✓ Added in Compare' : 'Add to Compare'}
              </button>

              {compareMessage && (
                <div className="compare-toast-msg">
                  {compareMessage}
                </div>
              )}
            </div>

            <div className="sticky-perks-list">
              <div className="perk-row">
                <span>⚡</span> Instant Confirmation
              </div>
              <div className="perk-row">
                <span>🛡️</span> Verified Luxury Partner
              </div>
              <div className="perk-row">
                <span>💳</span> Best Price Guaranteed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;

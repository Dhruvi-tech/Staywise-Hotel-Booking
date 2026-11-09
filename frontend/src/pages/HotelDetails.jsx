import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ImageGallery from '../components/ImageGallery';
import Rating from '../components/Rating';
import AmenityList from '../components/AmenityList';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import {
  fetchHotelById,
  fetchHotelReviews,
  createReview,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  recordRecentlyViewed
} from '../utils/api';
import { useAuth } from '../context/AuthContext';
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
  const { user, isAuthenticated } = useAuth();
  const [isCompared, setIsCompared] = useState(false);
  const [compareMessage, setCompareMessage] = useState('');

  // Wishlist & Reviews state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

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
      setIsCompared(isInCompare(data.id || data.customId));

      // Telemetry: record recently viewed
      recordRecentlyViewed(data.customId || data._id);

      // Check wishlist if user logged in
      if (isAuthenticated) {
        getWishlist().then((list) => {
          const inList = list.some((item) => item.customId === data.customId || item._id === data._id);
          setIsWishlisted(inList);
        }).catch(() => {});
      }

      // Load reviews
      loadReviews(data.customId || data._id);
    } catch (err) {
      console.error('Error fetching hotel details:', err);
      setError('Unable to load hotel details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (hotelIdentifier) => {
    setReviewsLoading(true);
    try {
      const revs = await fetchHotelReviews(hotelIdentifier);
      setReviews(revs || []);
    } catch (e) {
      // quiet fail
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/hotels/${id}` } } });
      return;
    }
    const targetId = hotel.customId || hotel._id;
    try {
      if (isWishlisted) {
        await removeFromWishlist(targetId);
        setIsWishlisted(false);
        setWishlistMessage('Removed from your wishlist.');
      } else {
        await addToWishlist(targetId);
        setIsWishlisted(true);
        setWishlistMessage('Saved to your wishlist! 💖');
      }
      setTimeout(() => setWishlistMessage(''), 2500);
    } catch (err) {
      setWishlistMessage(err.message || 'Action failed');
      setTimeout(() => setWishlistMessage(''), 2500);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await createReview({
        hotelId: hotel.customId || hotel._id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment
      });
      setReviewSuccess('Thank you! Your verified review has been posted.');
      setReviewForm({ rating: 5, title: '', comment: '' });
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccess('');
        loadReviews(hotel.customId || hotel._id);
      }, 1500);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
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

          {/* Verified Guest Reviews Section */}
          <div className="details-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 className="card-section-title" style={{ marginBottom: '0.25rem' }}>Verified Guest Reviews</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-gold)' }}>★ {hotel.rating}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({hotel.reviewsCount || reviews.length} verified experiences)</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: { pathname: `/hotels/${id}` } } });
                    return;
                  }
                  setReviewModalOpen(true);
                }}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                ✍️ Write a Review
              </button>
            </div>

            {reviewsLoading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Loading verified reviews...</p>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  No guest reviews submitted yet for this property.
                </p>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Guests with confirmed stays can submit verified reviews.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((rev) => (
                  <div key={rev._id} style={{ padding: '1rem', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{rev.user?.name || 'Verified Traveler'}</strong>
                        <span style={{ fontSize: '0.75rem', background: 'var(--emerald-light)', color: 'var(--emerald)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                          ✓ Verified Stay
                        </span>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </span>
                    </div>
                    {rev.title && (
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                        {rev.title}
                      </h4>
                    )}
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {rev.comment}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
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

              <button
                type="button"
                className={`btn btn-block ${isWishlisted ? 'btn-primary' : 'btn-outline'}`}
                onClick={handleWishlistToggle}
                style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                {isWishlisted ? '💖 Saved in Wishlist' : '🤍 Save to Wishlist'}
              </button>

              {(compareMessage || wishlistMessage) && (
                <div className="compare-toast-msg">
                  {wishlistMessage || compareMessage}
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

      {/* Review Submission Modal */}
      {reviewModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-floating)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>Verified Stay Review</h3>
              <button onClick={() => setReviewModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Share your genuine feedback for <strong>{hotel.name}</strong>. Only verified reservation holders may submit.
            </p>

            {reviewError && (
              <div style={{ background: 'var(--accent-rose-light)', color: 'var(--accent-rose)', padding: '0.75rem', borderRadius: 'var(--radius-xs)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {reviewError}
              </div>
            )}

            {reviewSuccess && (
              <div style={{ background: 'var(--emerald-light)', color: 'var(--emerald)', padding: '0.75rem', borderRadius: 'var(--radius-xs)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {reviewSuccess}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.75rem',
                        cursor: 'pointer',
                        color: star <= reviewForm.rating ? 'var(--accent-gold)' : 'var(--border-strong)',
                        padding: 0
                      }}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{ alignSelf: 'center', marginLeft: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    {reviewForm.rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Headline (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Unforgettable sea view experience!"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Review Details *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Detail the hospitality, dining, comfort, and service..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setReviewModalOpen(false)} className="btn btn-outline" style={{ padding: '0.55rem 1rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={reviewSubmitting} className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
                  {reviewSubmitting ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;

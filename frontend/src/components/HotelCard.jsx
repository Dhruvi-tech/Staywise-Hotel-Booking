import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Rating from './Rating';
import AmenityList from './AmenityList';
import { addToCompare, isInCompare, removeFromCompare } from '../utils/storage';

/**
 * Student Modification #3: Rule-based Hotel Match & Value Score
 * Evaluates rating, price, and amenities to award a badge without external APIs or AI.
 */
const getHotelMatchBadge = (hotel) => {
  if (!hotel) return null;
  const rating = Number(hotel.rating) || 0;
  const price = Number(hotel.price) || 0;
  const amenityCount = hotel.amenities?.length || 0;

  if (rating >= 4.8) {
    return { text: 'Highly Rated', badgeClass: 'badge-highlight-rated', icon: '⭐' };
  }
  if (rating >= 4.5 && price <= 4000) {
    return { text: 'Great Value', badgeClass: 'badge-highlight-value', icon: '💎' };
  }
  if (amenityCount >= 4 && rating >= 4.4) {
    return { text: 'Good Match', badgeClass: 'badge-highlight-match', icon: '✨' };
  }
  return null;
};

const HotelCard = ({ hotel, onCompare = null }) => {
  const navigate = useNavigate();
  const [compared, setCompared] = useState(false);
  const [compareNotice, setCompareNotice] = useState('');

  useEffect(() => {
    if (hotel && hotel.id) {
      setCompared(isInCompare(hotel.id));
    }
  }, [hotel]);

  if (!hotel) return null;

  const matchBadge = getHotelMatchBadge(hotel);

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/hotels/${hotel.id}`);
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (compared) {
      removeFromCompare(hotel.id);
      setCompared(false);
      setCompareNotice('Removed from compare');
      setTimeout(() => setCompareNotice(''), 2500);
      if (onCompare) onCompare(false, hotel.id);
    } else {
      const result = addToCompare(hotel);
      if (result.success) {
        setCompared(true);
        setCompareNotice('Added to compare! (Max 3)');
        setTimeout(() => setCompareNotice(''), 2500);
        if (onCompare) onCompare(true, hotel.id);
      } else {
        setCompareNotice(result.message);
        setTimeout(() => setCompareNotice(''), 3000);
      }
    }
  };

  const mainImage = hotel.images && hotel.images.length > 0
    ? hotel.images[0]
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="hotel-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {/* Top Image Container */}
      <div className="card-image-wrap">
        <img
          src={mainImage}
          alt={hotel.name}
          className="card-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Student Modification #3 Badge (Top Left) */}
        {matchBadge && (
          <div className={`card-match-badge ${matchBadge.badgeClass}`}>
            <span>{matchBadge.icon}</span>
            <span>{matchBadge.text}</span>
          </div>
        )}

        {/* Rating Pill on image (Top Right) */}
        <div className="card-badge-rating">
          <span className="rating-star-icon">⭐</span>
          <span className="rating-score">{Number(hotel.rating).toFixed(1)}</span>
        </div>

        {/* Location badge on image (Bottom Left) */}
        <div className="card-badge-location">
          <span className="location-pin">📍</span> {hotel.location}
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Rating and Reviews component */}
        <div className="card-rating-row">
          <span className="card-reviews-count">👥 {hotel.reviewsCount} reviews</span>
          <span className="room-type-tag">{hotel.roomType || 'Deluxe Room'}</span>
        </div>

        <h3 className="card-title">
          <Link to={`/hotels/${hotel.id}`}>{hotel.name}</Link>
        </h3>

        <p className="card-description">
          {hotel.tagline || hotel.description?.slice(0, 95) + '...'}
        </p>

        {/* Amenities preview */}
        <AmenityList amenities={hotel.amenities} limit={3} isCard={true} />

        {/* Feedback Alert if Compare clicked */}
        {compareNotice && (
          <div className="compare-mini-alert">
            {compareNotice}
          </div>
        )}

        {/* Card Footer: Price & Actions */}
        <div className="card-footer">
          <div className="card-price-wrap">
            <span className="price-label">Price per night</span>
            <div className="price-value">
              ₹{hotel.price.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="card-actions">
            <button
              type="button"
              className={`btn-compare ${compared ? 'compared-active' : ''}`}
              onClick={handleCompareClick}
              title={compared ? 'Remove from comparison' : 'Compare this hotel'}
            >
              {compared ? '✓ Compared' : '⚖ Compare'}
            </button>
            <Link to={`/hotels/${hotel.id}`} className="btn btn-primary btn-sm">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;

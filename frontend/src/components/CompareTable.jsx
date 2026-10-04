import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES_TO_COMPARE = [
  { key: 'location', label: 'Location' },
  { key: 'price', label: 'Price per Night', isPrice: true },
  { key: 'rating', label: 'Guest Rating', isRating: true },
  { key: 'reviewsCount', label: 'Reviews Count', isReviews: true },
  { key: 'roomType', label: 'Room Type' },
  { key: 'Wi-Fi', label: 'Free Wi-Fi', isAmenity: true },
  { key: 'Breakfast', label: 'Breakfast Included', isAmenity: true },
  { key: 'Swimming Pool', label: 'Swimming Pool', isAmenity: true },
  { key: 'Parking', label: 'Free Parking', isAmenity: true },
  { key: 'Air Conditioning', label: 'Air Conditioning', isAmenity: true }
];

/**
 * Student Modification #1: Rule-based "Best Value" Hotel Scoring
 * Evaluates rating, price, and amenities without external APIs or AI.
 */
const getBestValueHotelId = (hotels) => {
  if (!hotels || hotels.length < 2) return null;
  let bestId = null;
  let highestScore = -Infinity;

  hotels.forEach((h) => {
    const ratingScore = (Number(h.rating) || 0) * 15;
    const amenityScore = (h.amenities?.length || 0) * 4;
    const priceScore = (10000 - (Number(h.price) || 5000)) / 100;
    const totalScore = ratingScore + amenityScore + priceScore;

    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestId = h.id;
    }
  });

  return bestId;
};

const CompareTable = ({
  compareHotels = [],
  allHotels = [],
  onRemove,
  onClear,
  onAdd
}) => {
  // Determine best value among selected
  const bestValueId = getBestValueHotelId(compareHotels);

  // Available hotels to add to compare
  const selectableHotels = allHotels.filter(
    (h) => !compareHotels.some((c) => c.id === h.id)
  );

  return (
    <div className="compare-table-wrapper">
      <div className="compare-table-top-bar">
        <div className="compare-status-text">
          Comparing <strong>{compareHotels.length}</strong> of <strong>3</strong> hotels
          {bestValueId && (
            <span className="compare-best-value-hint">
              • 💎 Best Value identified by smart score
            </span>
          )}
        </div>
        <div className="compare-actions-bar">
          {compareHotels.length < 3 && selectableHotels.length > 0 && (
            <div className="compare-add-dropdown-wrap">
              <select
                className="compare-add-select"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    const selected = allHotels.find((h) => h.id === e.target.value);
                    if (selected) onAdd(selected);
                    e.target.value = '';
                  }
                }}
              >
                <option value="" disabled>
                  + Add another hotel to compare...
                </option>
                {selectableHotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.location} — ₹{h.price.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          )}
          {compareHotels.length > 0 && (
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={onClear}>
              Clear Comparison
            </button>
          )}
        </div>
      </div>

      <div className="compare-scroll-container">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="feature-col-header">Comparison Metric</th>
              {compareHotels.map((hotel) => {
                const isBestValue = hotel.id === bestValueId;
                return (
                  <th key={hotel.id} className={`hotel-col-header ${isBestValue ? 'col-best-value' : ''}`}>
                    <div className="compare-card-head">
                      {isBestValue && (
                        <div className="best-value-badge">
                          <span>💎 BEST VALUE</span>
                        </div>
                      )}
                      <img
                        src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'}
                        alt={hotel.name}
                        className="compare-head-img"
                      />
                      <h4 className="compare-head-title">{hotel.name}</h4>
                      <p className="compare-head-location">📍 {hotel.location}</p>
                      <div className="compare-head-actions">
                        <Link to={`/booking/${hotel.id}`} className="btn btn-primary btn-sm btn-block">
                          Book Now
                        </Link>
                        <button
                          type="button"
                          className="btn btn-text-danger btn-xs"
                          onClick={() => onRemove(hotel.id)}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  </th>
                );
              })}

              {/* Empty placeholder columns if fewer than 3 */}
              {Array.from({ length: 3 - compareHotels.length }).map((_, index) => (
                <th key={`empty-${index}`} className="hotel-col-empty">
                  <div className="compare-empty-placeholder">
                    <div className="empty-slot-icon">➕</div>
                    <p className="empty-slot-text">Empty Slot {compareHotels.length + index + 1}</p>
                    <span className="empty-slot-hint">Add from the dropdown above or from Hotels catalog</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES_TO_COMPARE.map((feat) => (
              <tr key={feat.key}>
                <td className="feature-name-cell">
                  <strong>{feat.label}</strong>
                </td>
                {compareHotels.map((hotel) => {
                  let cellContent = '—';

                  if (feat.isPrice) {
                    cellContent = (
                      <span className="compare-price-val">
                        ₹{hotel.price.toLocaleString('en-IN')} <small>/ night</small>
                      </span>
                    );
                  } else if (feat.isRating) {
                    cellContent = (
                      <span className="compare-rating-val">
                        ⭐ {Number(hotel.rating).toFixed(1)} / 5.0
                      </span>
                    );
                  } else if (feat.isReviews) {
                    cellContent = (
                      <span className="compare-reviews-val">
                        {hotel.reviewsCount || 120} reviews
                      </span>
                    );
                  } else if (feat.isAmenity) {
                    const hasAmenity = hotel.amenities?.some(
                      (a) => a.toLowerCase().includes(feat.key.toLowerCase())
                    );
                    cellContent = hasAmenity ? (
                      <span className="badge-amenity-yes">✓ Included</span>
                    ) : (
                      <span className="badge-amenity-no">✕ Not Available</span>
                    );
                  } else {
                    cellContent = hotel[feat.key] || '—';
                  }

                  const isBestValue = hotel.id === bestValueId;

                  return (
                    <td key={hotel.id} className={`feature-val-cell ${isBestValue ? 'cell-best-value' : ''}`}>
                      {cellContent}
                    </td>
                  );
                })}

                {/* Empty column placeholder cells */}
                {Array.from({ length: 3 - compareHotels.length }).map((_, index) => (
                  <td key={`empty-td-${index}`} className="feature-val-empty">
                    —
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareTable;

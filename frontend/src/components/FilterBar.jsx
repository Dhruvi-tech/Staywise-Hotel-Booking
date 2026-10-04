import React from 'react';

const AMENITY_OPTIONS = [
  'Wi-Fi',
  'Breakfast',
  'Swimming Pool',
  'Parking',
  'Air Conditioning',
  'Gym'
];

const AMENITY_ICONS = {
  'Wi-Fi': '📶',
  'Breakfast': '🍳',
  'Swimming Pool': '🏊',
  'Parking': '🚗',
  'Air Conditioning': '❄️',
  'Gym': '💪'
};

const DESTINATIONS = [
  'Goa',
  'Manali',
  'Jaipur',
  'Udaipur',
  'Bangalore',
  'Mumbai'
];

const FilterBar = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults = 0,
  isMobileDrawer = false,
  onCloseDrawer = null
}) => {
  const handleLocationChange = (e) => {
    onFilterChange({ ...filters, location: e.target.value });
  };

  const handlePriceChange = (e) => {
    onFilterChange({ ...filters, maxPrice: Number(e.target.value) });
  };

  const handleRatingChange = (ratingVal) => {
    onFilterChange({ ...filters, minRating: ratingVal });
  };

  const handleAmenityToggle = (amenity) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((item) => item !== amenity)
      : [...current, amenity];
    onFilterChange({ ...filters, amenities: updated });
  };

  return (
    <div className={`filter-sidebar ${isMobileDrawer ? 'mobile-drawer' : ''}`}>
      <div className="filter-header">
        <div className="filter-title-wrap">
          <span className="filter-icon">⚙️</span>
          <h3 className="filter-heading">Filters</h3>
        </div>
        <div className="filter-header-actions">
          <button
            type="button"
            className="filter-reset-link"
            onClick={onResetFilters}
          >
            Reset All
          </button>
          {isMobileDrawer && onCloseDrawer && (
            <button
              type="button"
              className="drawer-close-btn"
              onClick={onCloseDrawer}
              aria-label="Close filters"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter 1: Destination */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-location-select">
          Destination
        </label>
        <select
          id="filter-location-select"
          className="filter-select"
          value={filters.location || ''}
          onChange={handleLocationChange}
        >
          <option value="">All Destinations</option>
          {DESTINATIONS.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Filter 2: Price Range */}
      <div className="filter-group">
        <div className="filter-label-row">
          <label className="filter-label" htmlFor="filter-price-range">Max Price / Night</label>
          <span className="filter-val-badge">₹{Number(filters.maxPrice).toLocaleString('en-IN')}</span>
        </div>
        <input
          id="filter-price-range"
          type="range"
          min="1500"
          max="12000"
          step="500"
          value={filters.maxPrice}
          onChange={handlePriceChange}
          className="filter-range-slider"
        />
        <div className="filter-range-labels">
          <span>₹1,500</span>
          <span>₹12,000</span>
        </div>
      </div>

      {/* Filter 3: Customer Rating */}
      <div className="filter-group">
        <label className="filter-label">Minimum Rating</label>
        <div className="rating-filter-options">
          {[
            { label: 'All Ratings', val: 0 },
            { label: '4.5★ & above', val: 4.5 },
            { label: '4.7★ & above', val: 4.7 }
          ].map((r) => (
            <button
              key={r.val}
              type="button"
              className={`rating-pill-btn ${filters.minRating === r.val ? 'active' : ''}`}
              onClick={() => handleRatingChange(r.val)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter 4: Amenities Interactive Filter Pills */}
      <div className="filter-group">
        <div className="filter-label-row">
          <label className="filter-label">Amenities</label>
          {filters.amenities && filters.amenities.length > 0 && (
            <span className="filter-val-badge">
              {filters.amenities.length} selected
            </span>
          )}
        </div>
        <div className="amenities-filter-grid">
          {AMENITY_OPTIONS.map((amenity) => {
            const isChecked = (filters.amenities || []).includes(amenity);
            const icon = AMENITY_ICONS[amenity] || '✨';
            return (
              <button
                key={amenity}
                type="button"
                className={`amenity-filter-chip ${isChecked ? 'active' : ''}`}
                onClick={() => handleAmenityToggle(amenity)}
                aria-pressed={isChecked}
              >
                <span className="amenity-chip-icon">{icon}</span>
                <span className="amenity-chip-name">{amenity}</span>
                <span className="amenity-chip-indicator">
                  {isChecked ? '✓' : '+'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Meta */}
      <div className="filter-footer-meta">
        <span>✨ Verified Luxury Stays</span>
      </div>
    </div>
  );
};

export default FilterBar;

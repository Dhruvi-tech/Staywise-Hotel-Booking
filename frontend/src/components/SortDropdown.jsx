import React from 'react';

const SortDropdown = ({ sortBy, onSortChange }) => {
  return (
    <div className="sort-dropdown-wrap">
      <label htmlFor="hotel-sort-select" className="sort-label">
        Sort By:
      </label>
      <select
        id="hotel-sort-select"
        className="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="recommended">Recommended</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="rating-high">Rating: High to Low</option>
      </select>
    </div>
  );
};

export default SortDropdown;

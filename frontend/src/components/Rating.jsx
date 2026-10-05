import React from 'react';

/**
 * Reusable Rating Component (Parent-Child Props Demonstration)
 * Renders star score, numerical value, and optional reviews count.
 */
const Rating = ({ rating = 0, reviewsCount = null, size = 'md' }) => {
  const numericRating = Number(rating) || 0;

  return (
    <div className={`rating-component rating-${size}`}>
      <div className="rating-badge">
        <span className="star-symbol">★</span>
        <span className="rating-number">{numericRating.toFixed(1)}</span>
      </div>
      {reviewsCount !== null && (
        <span className="rating-reviews-sub">
          ({reviewsCount} reviews)
        </span>
      )}
    </div>
  );
};

export default Rating;

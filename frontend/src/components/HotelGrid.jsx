import React from 'react';
import HotelCard from './HotelCard';

const HotelGrid = ({
  hotels = [],
  onCompare = null,
  emptyMessage = 'No hotels found matching your filters.'
}) => {
  if (!hotels || hotels.length === 0) {
    return (
      <div className="hotel-grid-empty">
        <div className="empty-icon">🔍</div>
        <h3 className="empty-title">{emptyMessage}</h3>
        <p className="empty-subtitle">
          Try adjusting your search criteria, clearing selected filters, or searching a different city.
        </p>
      </div>
    );
  }

  return (
    <div className="hotel-grid">
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.id}
          hotel={hotel}
          onCompare={onCompare}
        />
      ))}
    </div>
  );
};

export default HotelGrid;

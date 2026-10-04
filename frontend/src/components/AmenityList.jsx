import React from 'react';

/**
 * Reusable AmenityList Component (Parent-Child Props Demonstration)
 * Renders list of amenities with clean icons.
 */
const AMENITY_ICONS = {
  'Wi-Fi': '📶',
  'Breakfast': '🍳',
  'Swimming Pool': '🏊',
  'Pool': '🏊',
  'Parking': '🚗',
  'Air Conditioning': '❄️',
  'Gym': '💪'
};

const AmenityList = ({ amenities = [], limit = null, isCard = false }) => {
  if (!amenities || amenities.length === 0) return null;

  const displayList = limit ? amenities.slice(0, limit) : amenities;
  const remainingCount = limit && amenities.length > limit ? amenities.length - limit : 0;

  return (
    <div className={`amenity-list-wrap ${isCard ? 'amenity-list-card' : 'amenity-list-details'}`}>
      {displayList.map((item, index) => {
        const icon = AMENITY_ICONS[item] || '✓';
        return (
          <span key={index} className="amenity-chip-item">
            <span className="amenity-chip-icon">{icon}</span>
            <span className="amenity-chip-label">{item}</span>
          </span>
        );
      })}
      {remainingCount > 0 && (
        <span className="amenity-chip-item amenity-chip-more">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

export default AmenityList;

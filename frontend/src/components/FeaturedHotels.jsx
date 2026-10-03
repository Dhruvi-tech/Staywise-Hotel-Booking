import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import HotelCard from './HotelCard';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Curated Stays', icon: '✦' },
  { id: 'beach', label: 'Beachfront Resorts', icon: '🏖️', cities: ['Goa'] },
  { id: 'mountain', label: 'Mountain Lodges', icon: '🏔️', cities: ['Manali'] },
  { id: 'heritage', label: 'Royal Palaces', icon: '👑', cities: ['Jaipur', 'Udaipur'] },
  { id: 'metro', label: 'Metropolitan Suites', icon: '🌆', cities: ['Mumbai', 'Bangalore'] }
];

const FeaturedHotels = ({ hotels = [] }) => {
  const [activeTab, setActiveTab] = useState('all');

  // Filter hotels based on selected curated category
  const filteredList = useMemo(() => {
    if (!hotels || hotels.length === 0) return [];

    if (activeTab === 'all') {
      // Pick top-rated handpicked stays across diverse destinations
      const featured = hotels.filter((h) => h.featured);
      return featured.length >= 8 ? featured.slice(0, 8) : hotels.slice(0, 8);
    }

    const currentTab = CATEGORY_TABS.find((t) => t.id === activeTab);
    if (!currentTab || !currentTab.cities) return hotels.slice(0, 8);

    const matching = hotels.filter((h) => currentTab.cities.includes(h.location));
    return matching.slice(0, 8);
  }, [hotels, activeTab]);

  if (!hotels || hotels.length === 0) return null;

  return (
    <section className="section-padding featured-hotels-section">
      <div className="section-header-center">
        <span className="section-badge">Curated Collection</span>
        <h2 className="section-title">Handpicked Stays Worth Remembering</h2>
        <p className="section-desc">
          Immerse yourself in our premier retreats, heritage havelis, and coastal sanctuaries across India.
        </p>

        {/* Dynamic Category Filter Pills */}
        <div className="curated-tabs-bar" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`curated-tab-pill ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.45rem 1.15rem',
                  borderRadius: '9999px',
                  border: isActive ? '1px solid #18181b' : '1px solid #e4e4e7',
                  backgroundColor: isActive ? '#18181b' : '#ffffff',
                  color: isActive ? '#ffffff' : '#3f3f46',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: isActive ? '0 4px 14px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of 8 Curated Hotel Cards */}
      <div className="hotel-grid">
        {filteredList.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>

      {/* Bottom Exploration Action */}
      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <Link to="/hotels" className="btn btn-outline-primary btn-lg" style={{ borderRadius: '9999px', padding: '0.75rem 2rem', fontWeight: 700 }}>
          Explore Full 84 Hotel Collection →
        </Link>
      </div>
    </section>
  );
};

export default FeaturedHotels;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

const TRENDING_DESTINATIONS = [
  { name: 'Goa', icon: '🏖️', label: 'Goa Beaches' },
  { name: 'Udaipur', icon: '🏰', label: 'Udaipur Lakes' },
  { name: 'Manali', icon: '🏔️', label: 'Manali Valleys' },
  { name: 'Jaipur', icon: '👑', label: 'Jaipur Palaces' },
  { name: 'Bangalore', icon: '🌿', label: 'Bengaluru Silicon' },
  { name: 'Mumbai', icon: '🌆', label: 'Mumbai Promenade' }
];

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        {/* Subtle Editorial Top Pill */}
        <div className="hero-badge-pill">
          <span className="badge-dot"></span>
          <span>✦ CURATED RETREATS ACROSS INDIA • BESPOKE HOSPITALITY</span>
        </div>

        {/* Editorial Serif Title */}
        <h1 className="hero-title">
          Bespoke Stays Handcrafted for Unforgettable Journeys.
        </h1>
        <p className="hero-subtitle">
          Explore iconic heritage palaces, tranquil coastal villas, and high-altitude mountain sanctuaries — with side-by-side comparison and exact budget precision.
        </p>

        {/* Floating Capsule Search Bar */}
        <div className="hero-search-wrapper">
          <SearchBar />
        </div>

        {/* Quick Inspiration Pills */}
        <div className="hero-trending-row">
          <span className="trending-label">Trending Destinations:</span>
          <div className="trending-pills">
            {TRENDING_DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                type="button"
                className="trending-pill"
                onClick={() => navigate(`/hotels?location=${encodeURIComponent(dest.name)}`)}
              >
                <span>{dest.icon}</span>
                <span>{dest.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subtle Editorial Trust Bar */}
        <div className="hero-editorial-trust-bar">
          <div className="trust-pill-item">
            <span className="trust-icon">💎</span>
            <span>Handpicked Boutique Stays</span>
          </div>
          <div className="trust-divider-dot">•</div>
          <div className="trust-pill-item">
            <span className="trust-icon">⚖️</span>
            <span>Side-by-Side Comparison Matrix</span>
          </div>
          <div className="trust-divider-dot">•</div>
          <div className="trust-pill-item">
            <span className="trust-icon">🎯</span>
            <span>Exact Budget Calculation</span>
          </div>
          <div className="trust-divider-dot">•</div>
          <div className="trust-pill-item">
            <span className="trust-icon">⭐</span>
            <span>4.8★ Verified Traveler Ratings</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

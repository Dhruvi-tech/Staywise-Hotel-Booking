import React from 'react';
import { Link } from 'react-router-dom';

const DESTINATIONS = [
  {
    name: 'Goa',
    tagline: 'Sun, Sand & Coastal Resorts',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Manali',
    tagline: 'Snow-Capped Peaks & Alpine Valleys',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Jaipur',
    tagline: 'Pink City Palaces & Royal Forts',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Udaipur',
    tagline: 'Romantic Lakes & Marble Architecture',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Bangalore',
    tagline: 'Garden City & Modern Tech Hub',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Mumbai',
    tagline: 'Marine Drive Skyline & Ocean Promenade',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
  }
];

const PopularDestinations = () => {
  return (
    <section className="section-padding destinations-section">
      <div className="section-header-center">
        <span className="section-badge">Iconic Destinations</span>
        <h2 className="section-title">Popular Destinations</h2>
        <p className="section-desc">
          Discover handpicked stays in India's most sought-after holiday and city escapes.
        </p>
      </div>

      <div className="destinations-grid">
        {DESTINATIONS.map((dest) => (
          <Link
            key={dest.name}
            to={`/hotels?location=${encodeURIComponent(dest.name)}`}
            className="destination-card"
          >
            <div className="destination-img-wrap">
              <img
                src={dest.image}
                alt={dest.name}
                className="destination-img"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="destination-overlay"></div>
            </div>
            <div className="destination-content">
              <h3 className="dest-name">{dest.name}</h3>
              <p className="dest-tagline">{dest.tagline}</p>
              <span className="dest-link-text">Explore Stays →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularDestinations;

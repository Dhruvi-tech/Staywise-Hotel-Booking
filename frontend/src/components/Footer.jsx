import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <span className="brand-icon-sm">🏨</span>
              <span className="brand-title">StayWise</span>
            </div>
            <p className="footer-tagline">
              Find. Compare. Book. Stay.
            </p>
            <p className="footer-desc">
              Your trusted companion for discovering handpicked stays, comparing hotels side-by-side, and securing smooth travel reservations across India.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/hotels">Hotels</Link></li>
              <li><Link to="/compare">Compare Hotels</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div className="footer-col">
            <h4 className="footer-heading">Destinations</h4>
            <ul className="footer-links-list">
              <li><Link to="/hotels?location=Bangalore">Bangalore Stays</Link></li>
              <li><Link to="/hotels?location=Goa">Goa Resorts</Link></li>
              <li><Link to="/hotels?location=Mumbai">Mumbai Suites</Link></li>
              <li><Link to="/hotels?location=Delhi">Delhi Stays</Link></li>
              <li><Link to="/hotels?location=Jaipur">Jaipur Palaces</Link></li>
            </ul>
          </div>

          {/* Why StayWise / Trust */}
          <div className="footer-col">
            <h4 className="footer-heading">Why StayWise</h4>
            <ul className="footer-links-list">
              <li><span className="footer-subtext">✨ Verified Luxury Stays</span></li>
              <li><span className="footer-subtext">🛡️ Best Rate Guarantee</span></li>
              <li><span className="footer-subtext">⚡ Instant Confirmation</span></li>
              <li><span className="footer-badge">Curated Escapes</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} StayWise — Handcrafted Luxury Stays & Hotel Reservations.</p>
          <div className="footer-bottom-links">
            <Link to="/">Home</Link>
            <span>•</span>
            <Link to="/hotels">Browse Catalog</Link>
            <span>•</span>
            <Link to="/compare">Compare</Link>
            <span>•</span>
            <Link to="/my-bookings">My Bookings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getCompareList } from '../utils/storage';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compareCount, setCompareCount] = useState(0);

  const updateCompareCount = () => {
    setCompareCount(getCompareList().length);
  };

  useEffect(() => {
    updateCompareCount();
    const handleStorageChange = () => {
      updateCompareCount();
    };
    window.addEventListener('staywise_storage_change', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('staywise_storage_change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">StayWise</span>
            <span className="brand-sub">Find • Compare • Book</span>
          </div>
        </Link>

        {/* Navigation Links: Home, Hotels, Compare, My Bookings */}
        <nav className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Home
          </NavLink>
          <NavLink
            to="/hotels"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Hotels
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Compare
            {compareCount > 0 && <span className="nav-badge">{compareCount}</span>}
          </NavLink>
          <NavLink
            to="/my-bookings"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            My Bookings
          </NavLink>
        </nav>

        {/* Right side Explore Hotels button & mobile toggle */}
        <div className="navbar-actions">
          <Link to="/hotels" className="btn btn-primary nav-cta-btn" onClick={closeMobileMenu}>
            Explore Hotels
          </Link>

          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import SortDropdown from '../components/SortDropdown';
import HotelGrid from '../components/HotelGrid';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchHotels } from '../utils/api';
import { getCompareList, removeFromCompare, clearCompare } from '../utils/storage';

const QUICK_CATEGORIES = [
  { id: 'all', label: 'All Stays', icon: '🏨' },
  { id: 'goa', label: 'Goa Beaches', icon: '🏖️', location: 'Goa' },
  { id: 'manali', label: 'Manali Mountains', icon: '🏔️', location: 'Manali' },
  { id: 'jaipur', label: 'Jaipur Heritage', icon: '👑', location: 'Jaipur' },
  { id: 'udaipur', label: 'Udaipur Lakes', icon: '🏰', location: 'Udaipur' },
  { id: 'bangalore', label: 'Bengaluru Silicon', icon: '🌿', location: 'Bangalore' },
  { id: 'mumbai', label: 'Mumbai Metro', icon: '🌆', location: 'Mumbai' },
  { id: 'topRated', label: 'Top Rated (4.8+)', icon: '⭐', minRating: 4.8 },
  { id: 'budget', label: 'Under ₹4,500', icon: '💰', maxPrice: 4500 }
];

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Hotel data states
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Compare Dock state (synchronizes dynamically via storage events)
  const [compareItems, setCompareItems] = useState(getCompareList());

  // Search input state
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  // Filter state
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    maxPrice: searchParams.get('budget') ? Number(searchParams.get('budget')) : 12000,
    minRating: 0,
    amenities: []
  });

  // Sort state: price-low, price-high, rating-high
  const [sortBy, setSortBy] = useState('price-low');

  // Mobile filters drawer open state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Synchronize when query parameters change
  useEffect(() => {
    const locParam = searchParams.get('location');
    const searchParam = searchParams.get('search');
    const budgetParam = searchParams.get('budget');

    setFilters((prev) => ({
      ...prev,
      ...(locParam !== null ? { location: locParam } : {}),
      ...(budgetParam !== null ? { maxPrice: Number(budgetParam) } : {})
    }));

    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Keep compare items in sync across clicks
  useEffect(() => {
    const handleStorageChange = () => {
      setCompareItems(getCompareList());
    };
    window.addEventListener('staywise_storage_change', handleStorageChange);
    return () => {
      window.removeEventListener('staywise_storage_change', handleStorageChange);
    };
  }, []);

  // Load hotels from backend API
  const loadHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHotels();
      setHotels(data);
    } catch (err) {
      console.error('Failed to load hotels:', err);
      setError('Unable to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  // Quick Category selection handler
  const handleCategorySelect = (cat) => {
    if (cat.id === 'all') {
      handleResetFilters();
      return;
    }

    setFilters((prev) => ({
      ...prev,
      location: cat.location || '',
      minRating: cat.minRating || 0,
      maxPrice: cat.maxPrice || 12000
    }));

    if (cat.location) {
      setSearchParams({ location: cat.location });
    } else {
      setSearchParams({});
    }
  };

  // Determine active category chip
  const activeCategoryId = useMemo(() => {
    if (filters.location === 'Goa') return 'goa';
    if (filters.location === 'Manali') return 'manali';
    if (filters.location === 'Jaipur') return 'jaipur';
    if (filters.location === 'Udaipur') return 'udaipur';
    if (filters.location === 'Bangalore') return 'bangalore';
    if (filters.location === 'Mumbai') return 'mumbai';
    if (filters.minRating >= 4.8 && !filters.location) return 'topRated';
    if (filters.maxPrice <= 4500 && !filters.location) return 'budget';
    if (!filters.location && filters.minRating === 0 && filters.maxPrice === 12000 && !searchQuery) return 'all';
    return null;
  }, [filters, searchQuery]);

  // Reset all filters & search
  const handleResetFilters = () => {
    setFilters({
      location: '',
      maxPrice: 12000,
      minRating: 0,
      amenities: []
    });
    setSearchQuery('');
    setSortBy('price-low');
    setSearchParams({});
  };

  // Filter and sort calculations
  const filteredAndSortedHotels = useMemo(() => {
    if (!hotels || hotels.length === 0) return [];

    let result = [...hotels];

    // 1. Text Search (Hotel Name or Location or Tagline)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.location.toLowerCase().includes(query) ||
          (h.tagline && h.tagline.toLowerCase().includes(query))
      );
    }

    // 2. Location filter
    if (filters.location) {
      result = result.filter(
        (h) => h.location.toLowerCase() === filters.location.toLowerCase()
      );
    }

    // 3. Price Range filter (max price)
    if (filters.maxPrice) {
      result = result.filter((h) => h.price <= filters.maxPrice);
    }

    // 4. Rating filter
    if (filters.minRating > 0) {
      result = result.filter((h) => h.rating >= filters.minRating);
    }

    // 5. Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      result = result.filter((h) =>
        filters.amenities.every((amenity) =>
          h.amenities && h.amenities.includes(amenity)
        )
      );
    }

    // 6. Sorting logic
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-high') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [hotels, searchQuery, filters, sortBy]);

  return (
    <div className="hotels-page-container">
      {/* Top Banner */}
      <div className="page-header-banner">
        <div className="page-header-content">
          <span className="page-header-badge">Discover & Reserve</span>
          <h1 className="page-header-title">Explore Stays</h1>
          <p className="page-header-desc">
            Find the ideal hotel for your getaway. Filter by destination, price, rating, and amenities.
          </p>
        </div>
      </div>

      <div className="hotels-layout-container">
        {/* Quick Category / Destination Filter Chips */}
        <div className="category-chips-scroll-wrap">
          <div className="category-chips-bar">
            {QUICK_CATEGORIES.map((cat) => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  <span className="chip-icon">{cat.icon}</span>
                  <span className="chip-label">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Search & Sort Controls Bar */}
        <div className="hotels-top-controls">
          <div className="search-input-wrapper">
            <span className="search-input-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by hotel name or city (e.g. Grand Bengaluru, Goa)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hotels-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="hotels-top-right-actions">
            <button
              type="button"
              className="btn btn-outline-primary mobile-filter-toggle-btn"
              onClick={() => setMobileFilterOpen(true)}
            >
              ⚙️ Filters {(filters.location || filters.minRating > 0 || filters.amenities.length > 0) && '•'}
            </button>

            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        </div>

        {/* Main Content: Sidebar Filter + Hotel Cards Grid */}
        <div className="hotels-main-grid-layout">
          {/* Desktop Filter Sidebar */}
          <aside className="hotels-filter-aside">
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              totalResults={filteredAndSortedHotels.length}
            />
          </aside>

          {/* Mobile Filter Drawer Overlay */}
          {mobileFilterOpen && (
            <div className="mobile-drawer-backdrop" onClick={() => setMobileFilterOpen(false)}>
              <div className="mobile-drawer-inner" onClick={(e) => e.stopPropagation()}>
                <FilterBar
                  filters={filters}
                  onFilterChange={setFilters}
                  onResetFilters={handleResetFilters}
                  totalResults={filteredAndSortedHotels.length}
                  isMobileDrawer={true}
                  onCloseDrawer={() => setMobileFilterOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Hotel Grid Area */}
          <main className="hotels-list-area">
            {loading ? (
              <Loading message="Loading hotels from StayWise catalog..." />
            ) : error ? (
              <ErrorMessage message={error} onRetry={loadHotels} />
            ) : filteredAndSortedHotels.length === 0 ? (
              <div className="no-results-box">
                <div className="no-results-icon">🏨</div>
                <h3 className="no-results-title">No stays found matching your search.</h3>
                <p className="no-results-text">
                  Try adjusting your search criteria, widening your price range, or clearing selected amenities.
                </p>
                <div className="no-results-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleResetFilters}
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="results-status-bar">
                  <div className="status-bar-left">
                    <span className="results-count-pill">
                      <span className="status-dot-indicator"></span>
                      Available Stays
                    </span>
                    {filters.location && (
                      <span className="active-filter-badge">
                        📍 {filters.location}
                      </span>
                    )}
                    {filters.minRating > 0 && (
                      <span className="active-filter-badge">
                        ⭐ {filters.minRating}★+
                      </span>
                    )}
                    {filters.maxPrice < 12000 && (
                      <span className="active-filter-badge">
                        💰 ≤ ₹{filters.maxPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="active-filter-badge">
                        🔍 "{searchQuery}"
                      </span>
                    )}
                  </div>

                  {(filters.location || filters.minRating > 0 || filters.amenities.length > 0 || filters.maxPrice < 12000 || searchQuery) && (
                    <button
                      type="button"
                      className="clear-filters-btn"
                      onClick={handleResetFilters}
                      title="Reset all filters and search"
                    >
                      <span className="clear-icon">✕</span> Clear filters
                    </button>
                  )}
                </div>

                <HotelGrid
                  hotels={filteredAndSortedHotels}
                  emptyMessage="No stays found matching your search."
                />
              </>
            )}
          </main>
        </div>
      </div>

      {/* Floating Compare Dock (Student Modification #1 Interactive Dock) */}
      {compareItems && compareItems.length > 0 && (
        <aside className="floating-compare-dock" aria-label="Compare selection dock">
          <div className="dock-inner-container">
            <div className="dock-left-content">
              <span className="dock-count-badge">{compareItems.length} of 3</span>
              <div className="dock-text-group">
                <span className="dock-heading">Compare Staged Stays</span>
                <span className="dock-subtext">Click Compare Now to see side-by-side breakdown</span>
              </div>
              <div className="dock-pills-list">
                {compareItems.map((item) => (
                  <span key={item.id} className="dock-hotel-pill">
                    <span className="dock-hotel-name">{item.name}</span>
                    <button
                      type="button"
                      className="dock-remove-btn"
                      onClick={() => removeFromCompare(item.id)}
                      title={`Remove ${item.name} from comparison`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="dock-right-actions">
              <Link to="/compare" className="btn btn-primary btn-sm dock-compare-cta">
                ⚖ Compare Now ({compareItems.length}) →
              </Link>
              <button
                type="button"
                className="btn btn-ghost btn-sm dock-clear-cta"
                onClick={() => clearCompare()}
                title="Clear all compared hotels"
              >
                Clear
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Hotels;

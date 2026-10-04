import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CompareTable from '../components/CompareTable';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchHotels } from '../utils/api';
import { getCompareList, removeFromCompare, clearCompare, addToCompare } from '../utils/storage';

const Compare = () => {
  const [allHotels, setAllHotels] = useState([]);
  const [compareHotels, setCompareHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const syncCompare = (hotelsPool) => {
    const stored = getCompareList();
    if (hotelsPool && hotelsPool.length > 0) {
      const updated = stored
        .map((s) => hotelsPool.find((h) => h.id === s.id) || s)
        .filter(Boolean);
      setCompareHotels(updated);
    } else {
      setCompareHotels(stored);
    }
  };

  const loadAllHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHotels();
      setAllHotels(data);
      syncCompare(data);
    } catch (err) {
      console.error('Error fetching hotels for compare:', err);
      setError('Unable to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllHotels();

    const handleStorageChange = () => {
      syncCompare(allHotels);
    };

    window.addEventListener('staywise_storage_change', handleStorageChange);
    return () => {
      window.removeEventListener('staywise_storage_change', handleStorageChange);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRemove = (hotelId) => {
    removeFromCompare(hotelId);
    setCompareHotels((prev) => prev.filter((h) => h.id !== hotelId));
    showToast('Hotel removed from comparison.');
  };

  const handleClearAll = () => {
    clearCompare();
    setCompareHotels([]);
    showToast('Comparison list cleared.');
  };

  const handleAddHotel = (hotel) => {
    const result = addToCompare(hotel);
    if (result.success) {
      setCompareHotels((prev) => [...prev, hotel]);
      showToast(`Added "${hotel.name}" to comparison!`);
    } else {
      showToast(result.message);
    }
  };

  if (loading) {
    return <Loading message="Loading hotel comparison..." />;
  }

  if (error) {
    return (
      <div className="section-padding">
        <ErrorMessage message={error} onRetry={loadAllHotels} />
      </div>
    );
  }

  return (
    <div className="compare-page-container">
      {/* Banner */}
      <div className="page-header-banner">
        <div className="page-header-content">
          <span className="page-header-badge">Side-by-Side Comparison</span>
          <h1 className="page-header-title">Compare Your Stays</h1>
          <p className="page-header-desc">
            Compare up to 3 hotels side-by-side on price, rating, reviews, and amenities. We highlight the Best Value stay.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="global-toast-alert">
          {toastMessage}
        </div>
      )}

      <div className="compare-content-container">
        {compareHotels.length === 0 ? (
          <div className="compare-empty-card">
            <div className="empty-icon">⚖️</div>
            <h2 className="empty-title">Select hotels from the Hotels page to compare them.</h2>
            <p className="empty-desc">
              Choose up to 3 hotels to view side-by-side pricing, amenities, and smart value calculation.
            </p>

            <div className="empty-actions" style={{ marginTop: '1.5rem' }}>
              <Link to="/hotels" className="btn btn-primary btn-lg">
                Explore Hotels
              </Link>
            </div>
          </div>
        ) : (
          <CompareTable
            compareHotels={compareHotels}
            allHotels={allHotels}
            onRemove={handleRemove}
            onClear={handleClearAll}
            onAdd={handleAddHotel}
          />
        )}
      </div>
    </div>
  );
};

export default Compare;

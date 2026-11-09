import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../utils/api';
import Loading from '../components/Loading';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const items = await getWishlist();
      setWishlist(items);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (hotelId) => {
    try {
      await removeFromWishlist(hotelId);
      setWishlist((prev) => prev.filter((h) => h._id !== hotelId && h.customId !== hotelId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  if (loading) {
    return <Loading text="Loading your saved dream stays..." />;
  }

  return (
    <div className="container" style={{ padding: '3.5rem 1rem', minHeight: '75vh' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600 }}>
          Curated Favourites
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginTop: '0.35rem', color: 'var(--text-main)' }}>
          Your Saved Properties
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {wishlist.length} luxury {wishlist.length === 1 ? 'hotel' : 'hotels'} saved for your upcoming journeys.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-strong)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💖</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Your wishlist is empty
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.92rem' }}>
            Explore our curated catalog of 84 signature stays across Goa, Rajasthan, Himachal and beyond to save your favorites.
          </p>
          <Link to="/hotels" className="btn btn-primary" style={{ padding: '0.8rem 1.75rem' }}>
            Explore Luxury Hotels
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {wishlist.map((hotel) => {
            const hotelId = hotel.customId || hotel._id;
            const heroImage = hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

            return (
              <div key={hotel._id || hotel.customId} className="card" style={{ background: '#fff', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-strong)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '200px' }}>
                  <img
                    src={heroImage}
                    alt={hotel.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(24, 24, 27, 0.85)', backdropFilter: 'blur(4px)', color: '#fff', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                    📍 {hotel.location}
                  </span>
                  <button
                    onClick={() => handleRemove(hotel._id)}
                    title="Remove from wishlist"
                    style={{ position: 'absolute', top: '12px', right: '12px', background: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600 }}>
                      ★ {hotel.rating} ({hotel.reviewsCount || 0})
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {hotel.roomType || 'Deluxe'}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)', lineHeight: 1.3 }}>
                    {hotel.name}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1, marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {hotel.tagline || hotel.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        ₹{hotel.price.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / night</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/hotels/${hotelId}`} className="btn btn-outline" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
                        Details
                      </Link>
                      <Link to={`/booking/${hotelId}`} className="btn btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
                        Book Stay
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Wishlist;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import FeaturedHotels from '../components/FeaturedHotels';
import PopularDestinations from '../components/PopularDestinations';
import Offers from '../components/Offers';
import Testimonials from '../components/Testimonials';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchHotels } from '../utils/api';

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHotels();
      setHotels(data);
    } catch (err) {
      console.error('Home load hotels error:', err);
      setError('Unable to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  return (
    <div className="home-page-container">
      {/* 1. Cinematic Hero with Floating Search Capsule */}
      <Hero />

      {/* 2. Curated Stays Showcase */}
      {loading ? (
        <Loading message="Loading curated luxury stays..." />
      ) : error ? (
        <div className="section-padding">
          <ErrorMessage message={error} onRetry={loadHotels} />
        </div>
      ) : (
        <FeaturedHotels hotels={hotels} />
      )}

      {/* 3. Iconic Destinations */}
      <PopularDestinations />

      {/* 4. Editorial Comparison Spotlight: Side-by-Side Visual Comparison */}
      <section className="section-padding compare-spotlight-section">
        <div className="compare-editorial-card">
          <div className="editorial-spotlight-text">
            <span className="editorial-spotlight-badge">✦ SIDE-BY-SIDE COMPARISON</span>
            <h2 className="editorial-spotlight-title">
              Compare Stays Side-by-Side with Complete Clarity.
            </h2>
            <p className="editorial-spotlight-desc">
              Torn between a historic palace in Rajasthan and a serene Goan beachfront villa? Compare up to 3 hotels simultaneously on verified amenities, guest reviews, and all-inclusive pricing.
            </p>

            <div className="editorial-spotlight-perks">
              <div className="perk-item">
                <span className="perk-icon">⚖️</span>
                <div className="perk-text-wrap">
                  <strong className="perk-title">Best Value Scoring</strong>
                  <p className="perk-desc">Smart algorithmic evaluation balancing price, ratings, and amenities.</p>
                </div>
              </div>
              <div className="perk-item">
                <span className="perk-icon">🏊</span>
                <div className="perk-text-wrap">
                  <strong className="perk-title">Direct Amenity Matrix</strong>
                  <p className="perk-desc">Review pools, private spas, complimentary breakfasts, and Wi-Fi side-by-side.</p>
                </div>
              </div>
            </div>

            <div className="editorial-spotlight-actions">
              <Link to="/compare" className="btn btn-primary btn-lg">
                Explore Comparison Matrix →
              </Link>
              <Link to="/hotels" className="btn btn-outline-primary btn-lg">
                Browse Full Catalog
              </Link>
            </div>
          </div>

          <div className="editorial-spotlight-visual">
            <div className="compare-duo-cards">
              {/* Hotel Card 1 */}
              <div className="duo-hotel-card primary">
                <div className="duo-img-wrap">
                  <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
                    alt="Taj Lake Palace"
                    className="duo-img"
                  />
                  <span className="duo-badge gold">🏆 Best Value Match</span>
                </div>
                <div className="duo-content">
                  <span className="duo-loc">📍 Udaipur, Rajasthan</span>
                  <h4 className="duo-name">Taj Lake Palace</h4>
                  <div className="duo-bottom">
                    <span className="duo-price">₹14,500 <small>/ night</small></span>
                    <span className="duo-rating">★ 4.9</span>
                  </div>
                </div>
              </div>

              {/* Hotel Card 2 */}
              <div className="duo-hotel-card secondary">
                <div className="duo-img-wrap">
                  <img
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80"
                    alt="The Leela Palace"
                    className="duo-img"
                  />
                  <span className="duo-badge neutral">Heritage Tier</span>
                </div>
                <div className="duo-content">
                  <span className="duo-loc">📍 Bengaluru, Karnataka</span>
                  <h4 className="duo-name">The Leela Palace</h4>
                  <div className="duo-bottom">
                    <span className="duo-price">₹18,200 <small>/ night</small></span>
                    <span className="duo-rating">★ 4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Themed Curated Experiences */}
      <Offers />

      {/* 6. The StayWise Standards (3 Refined Editorial Pillars) */}
      <section className="section-padding why-choose-section">
        <div className="section-header-center">
          <span className="section-badge">The StayWise Standard</span>
          <h2 className="section-title">Redefining Hotel Discovery</h2>
          <p className="section-desc">
            We eliminate travel booking uncertainty through upfront clarity, intelligent comparison, and curated quality.
          </p>
        </div>

        <div className="why-choose-grid">
          <div className="why-card">
            <div className="why-icon-bubble">🎯</div>
            <h3 className="why-title">Exact Budget Precision</h3>
            <p className="why-desc">
              Choose your starting date and number of days to view your exact, all-inclusive budget before reserving. Zero hidden fees or checkout surprises.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon-bubble">⚖️</div>
            <h3 className="why-title">Intelligent Comparison</h3>
            <p className="why-desc">
              Evaluate up to 3 hotels across pricing, verified amenities, guest ratings, and value scores side-by-side in real time.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon-bubble">✨</div>
            <h3 className="why-title">Handpicked Excellence</h3>
            <p className="why-desc">
              Every stay in our 84-hotel catalog is personally vetted for architectural character, authentic hospitality, and premium comfort.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Guest Stories & Testimonials */}
      <Testimonials />

      {/* 8. Editorial Closing Banner */}
      <section className="closing-cta-section">
        <div className="closing-cta-card">
          <div className="closing-cta-content">
            <span className="closing-badge">Begin Your Journey</span>
            <h2 className="closing-title">Find a Stay Worth Remembering.</h2>
            <p className="closing-desc">
              From historic Rajasthan palaces to tranquil Goan shores and high-altitude Himalayan chalets, experience India's finest stays.
            </p>
            <div className="closing-btn-group">
              <Link to="/hotels" className="btn btn-primary btn-lg">
                Explore Full Hotel Collection →
              </Link>
              <Link to="/compare" className="btn btn-outline-white btn-lg">
                Compare Stays
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

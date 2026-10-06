import React, { useState, useRef } from 'react';

const TESTIMONIAL_CATEGORIES = [
  { id: 'all', label: 'All Stories' },
  { id: 'palaces', label: 'Royal Palaces' },
  { id: 'beach', label: 'Beachfront Resorts' },
  { id: 'mountain', label: 'Mountain Lodges' },
  { id: 'metro', label: 'City Escapes' }
];

const TESTIMONIALS_DATA = [
  {
    id: 1,
    category: 'beach',
    name: 'Aanya Sharma',
    city: 'Bengaluru, Karnataka',
    rating: '5.0',
    role: 'Luxury Traveler',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    headline: 'Flawless Beachfront Escape',
    hotelName: 'Taj Fort Aguada Resort',
    location: 'Goa',
    duration: '3 Nights',
    review: 'Comparing beachside resorts side-by-side made choosing so effortless. The live budget breakdown for 3 days matched our final reservation down to the rupee with zero surprise charges. Unwinding by the Arabian Sea was pure magic.'
  },
  {
    id: 2,
    category: 'palaces',
    name: 'Meera Singhania',
    city: 'New Delhi',
    rating: '5.0',
    role: 'Honeymoon Guest',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    headline: 'Fairy-tale on Lake Pichola',
    hotelName: 'Taj Lake Palace',
    location: 'Udaipur',
    duration: '3 Nights',
    review: 'Arriving by royal boat at dusk was an experience we will cherish forever. The exact budget calculator gave complete peace of mind upfront, and the verified palace amenities exceeded every dream.'
  },
  {
    id: 3,
    category: 'mountain',
    name: 'Aditya Kulkarni',
    city: 'Mumbai, Maharashtra',
    rating: '5.0',
    role: 'Mountain Explorer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    headline: 'Peaceful Mountain Sanctuaries',
    hotelName: 'The Himalayan Lodge',
    location: 'Manali',
    duration: '5 Nights',
    review: 'I booked a 5-day mountain workation. The duration selector updated my checkout date instantly, and having verified high-speed Wi-Fi and wood-burning fireplaces confirmed upfront was unmatched.'
  },
  {
    id: 4,
    category: 'palaces',
    name: 'Sneha & Arun Joshi',
    city: 'Pune, Maharashtra',
    rating: '5.0',
    role: 'Heritage Lovers',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    headline: 'Unparalleled Rajput Splendor',
    hotelName: 'Rambagh Palace',
    location: 'Jaipur',
    duration: '4 Nights',
    review: 'We used the side-by-side comparison matrix to compare three heritage havelis. The Best Value algorithm recommended Rambagh Palace and it was easily the crown jewel of our entire trip.'
  },
  {
    id: 5,
    category: 'beach',
    name: 'Rohan & Tanya Mehta',
    city: 'Ahmedabad, Gujarat',
    rating: '5.0',
    role: 'Weekend Getaway',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    headline: 'Vibrant Coastal Haven',
    hotelName: 'W Goa Resort & Spa',
    location: 'Goa',
    duration: '4 Nights',
    review: 'The curated stays section spared us hours of scrolling through mediocre options. Every property shown has real design character. The private pool villa and sunset dining exceeded all expectations.'
  },
  {
    id: 6,
    category: 'metro',
    name: 'Dr. Farhan Qureshi',
    city: 'Hyderabad, Telangana',
    rating: '5.0',
    role: 'Executive Traveler',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    headline: 'Urban Luxury & Serene Gardens',
    hotelName: 'The Leela Palace',
    location: 'Bengaluru',
    duration: '2 Nights',
    review: 'StayWise sets the gold standard for honest hotel discovery. High-resolution photos that match the real property, verified luxury amenities, and an instant reservation system without any clutter.'
  },
  {
    id: 7,
    category: 'mountain',
    name: 'Devika Nambiar',
    city: 'Kochi, Kerala',
    rating: '5.0',
    role: 'Nature Connoisseur',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    headline: 'Misty Valleys & Tea Terraces',
    hotelName: 'Fragrant Nature Retreat',
    location: 'Munnar',
    duration: '3 Nights',
    review: 'Waking up to birdsong and misty green tea estates in Munnar was unforgettable. Choosing our starting date and 3-day duration gave us our exact budget right away. Booking was completely seamless.'
  },
  {
    id: 8,
    category: 'metro',
    name: 'Vikramaditya Roy',
    city: 'Kolkata, West Bengal',
    rating: '4.9',
    role: 'Architectural Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    headline: 'Iconic Harbor & Heritage Vistas',
    hotelName: 'The Taj Mahal Palace',
    location: 'Mumbai',
    duration: '2 Nights',
    review: 'The Sea Lounge views across the Gateway of India are transcendent. The comparison tool helped us choose between sea-facing and city-wing rooms with crystal-clear price breakdowns.'
  }
];

const Testimonials = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const scrollRef = useRef(null);

  const filteredTestimonials = activeCategory === 'all'
    ? TESTIMONIALS_DATA
    : TESTIMONIALS_DATA.filter((t) => t.category === activeCategory);

  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollOffset = 390;
      scrollRef.current.scrollBy({
        left: direction === 'next' ? scrollOffset : -scrollOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="section-padding testimonials-section">
      <div className="section-header-center">
        <span className="section-badge">✦ VERIFIED TRAVELER VOICES</span>
        <h2 className="section-title">Stories From Our Discerning Guests</h2>
        <p className="section-desc">
          Authentic reflections and verified stays from travelers discovering extraordinary boutique hotels across India.
        </p>
      </div>

      {/* Category Filter Pills & Carousel Scroll Navigation */}
      <div className="testimonials-controls-row">
        <div className="testimonials-filter-bar">
          {TESTIMONIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`testimonial-filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Carousel Arrow Buttons */}
        <div className="carousel-nav-arrows">
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={() => handleScroll('prev')}
            aria-label="Previous reviews"
            title="Scroll left"
          >
            ←
          </button>
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={() => handleScroll('next')}
            aria-label="Next reviews"
            title="Scroll right"
          >
            →
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Carousel Track */}
      <div className="testimonials-carousel-container">
        <div className="testimonials-carousel-track" ref={scrollRef}>
          {filteredTestimonials.map((t) => (
            <div key={t.id} className="testimonial-card carousel-card">
              {/* Top Row: Hotel Badge & Rating */}
              <div className="testimonial-card-top">
                <span className="testimonial-stay-badge">
                  📍 {t.hotelName} • {t.duration}
                </span>
                <div className="testimonial-rating">
                  <span className="star-gold">★★★★★</span>
                  <span className="rating-score">{t.rating}</span>
                </div>
              </div>

              {/* Review Headline & Body */}
              <h4 className="testimonial-headline">"{t.headline}"</h4>
              <p className="testimonial-quote">
                "{t.review}"
              </p>

              {/* Author Profile */}
              <div className="testimonial-author">
                <img
                  src={t.avatar}
                  alt=""
                  aria-hidden="true"
                  className="author-avatar"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                  }}
                />
                <div className="author-meta">
                  <div className="author-name-row">
                    <h4 className="author-name">{t.name}</h4>
                    <span className="verified-check-badge" title="Verified StayWise Traveler">✓ Verified</span>
                  </div>
                  <p className="author-role">{t.role} • {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Rating Summary Strip */}
      <div className="testimonials-trust-footer">
        <div className="trust-footer-item">
          <strong>4.9 / 5.0</strong>
          <span>Overall Guest Satisfaction</span>
        </div>
        <div className="trust-footer-divider"></div>
        <div className="trust-footer-item">
          <strong>100% Verified</strong>
          <span>Genuine Stay Reviews</span>
        </div>
        <div className="trust-footer-divider"></div>
        <div className="trust-footer-item">
          <strong>84 Boutique Stays</strong>
          <span>Curated Across Top Destinations</span>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

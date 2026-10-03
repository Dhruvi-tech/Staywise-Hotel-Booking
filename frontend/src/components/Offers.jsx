import React from 'react';
import { Link } from 'react-router-dom';

const EXPERIENCES = [
  {
    id: 'exp-1',
    tag: 'Royal Heritage',
    title: 'Palaces & Fort Haveli',
    desc: 'Grand courtyards, hand-carved jharokhas, and timeless Rajput hospitality in Jaipur and Udaipur.',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    link: '/hotels?location=Jaipur'
  },
  {
    id: 'exp-2',
    tag: 'Coastal Serenity',
    title: 'Private Beachfront Villas',
    desc: 'Sun-drenched private cabanas, Arabian Sea sunsets, and lush coconut palm groves in Goa.',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    link: '/hotels?location=Goa'
  },
  {
    id: 'exp-3',
    tag: 'Alpine Sanctuaries',
    title: 'Himalayan Mountain Lodges',
    desc: 'Pine-forested chalets, panoramic snow-covered ridges, and peaceful crisp air in Manali.',
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80',
    link: '/hotels?location=Manali'
  }
];

const Offers = () => {
  return (
    <section className="section-padding offers-section">
      <div className="section-header-center">
        <span className="section-badge">Curated Experiences</span>
        <h2 className="section-title">Themed Travel Collections</h2>
        <p className="section-desc">
          Handcrafted escapes designed around architectural heritage, coastal relaxation, and alpine mountain air.
        </p>
      </div>

      <div className="experiences-grid">
        {EXPERIENCES.map((exp) => (
          <Link to={exp.link} key={exp.id} className="experience-card">
            <div className="exp-img-wrapper">
              <img
                src={exp.image}
                alt={exp.title}
                className="exp-card-img"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="exp-card-overlay"></div>
              <span className="exp-tag-pill">{exp.tag}</span>
            </div>

            <div className="exp-card-content">
              <h3 className="exp-card-title">{exp.title}</h3>
              <p className="exp-card-desc">{exp.desc}</p>
              <span className="exp-card-action">
                <span>Explore Stays</span>
                <span className="arrow-icon">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Offers;

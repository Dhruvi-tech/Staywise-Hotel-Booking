import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-desc">
          The page or hotel stay you are looking for doesn't exist, has been relocated, or is temporarily unavailable.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary btn-lg">
            Return to Home
          </Link>
          <Link to="/hotels" className="btn btn-outline-primary btn-lg">
            Browse Hotels Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

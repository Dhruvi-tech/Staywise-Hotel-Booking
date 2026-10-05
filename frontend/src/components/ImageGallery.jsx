import React from 'react';

const ImageGallery = ({ images = [], hotelName = 'Hotel' }) => {
  if (!images || images.length === 0) {
    return (
      <div className="gallery-placeholder">
        <span>No images available</span>
      </div>
    );
  }

  const mainImage = images[0];
  const supportingImages = images.slice(1, 4);

  return (
    <div className="simple-hotel-gallery">
      {/* Main Large Hotel Image */}
      <div className="gallery-main-frame">
        <img
          src={mainImage}
          alt={`${hotelName} primary view`}
          className="gallery-primary-img"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
          }}
        />
      </div>

      {/* Supporting Images */}
      {supportingImages.length > 0 && (
        <div className="gallery-supporting-grid">
          {supportingImages.map((imgUrl, index) => (
            <div key={index} className="gallery-supporting-item">
              <img
                src={imgUrl}
                alt={`${hotelName} view ${index + 2}`}
                className="gallery-supporting-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

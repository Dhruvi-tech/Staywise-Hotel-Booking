import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchHotelById } from '../utils/api';

const Booking = () => {
  const { id, hotelId } = useParams();
  const activeId = id || hotelId || 'hotel-1';
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialStay = {
    checkIn: location.state?.checkIn || searchParams.get('checkIn') || '',
    days: location.state?.days || (searchParams.get('days') ? Number(searchParams.get('days')) : null),
    checkOut: location.state?.checkOut || searchParams.get('checkOut') || '',
    guests: location.state?.guests || searchParams.get('guests') || '',
    adults: location.state?.adults !== undefined ? location.state.adults : (searchParams.get('adults') || ''),
    children: location.state?.children !== undefined ? location.state.children : (searchParams.get('children') || ''),
    rooms: location.state?.rooms || searchParams.get('rooms') || ''
  };

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHotel = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHotelById(activeId);
      setHotel(data);
    } catch (err) {
      console.error('Error loading hotel for booking:', err);
      setError('Hotel not found or unavailable for booking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotel();
    window.scrollTo(0, 0);
  }, [activeId]);

  const handleBookingSuccess = (newBooking) => {
    // Navigate to confirmation page passing booking details in location state
    navigate('/booking-confirmation', { state: { booking: newBooking } });
  };

  if (loading) {
    return <Loading message="Preparing reservation details..." />;
  }

  if (error || !hotel) {
    return (
      <div className="section-padding">
        <ErrorMessage message={error || 'Hotel not found.'} onRetry={loadHotel} />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/hotels" className="btn btn-primary">
            ← Explore Other Hotels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page-container">
      {/* Top Banner */}
      <div className="page-header-banner">
        <div className="page-header-content">
          <span className="page-header-badge">Hotel Booking</span>
          <h1 className="page-header-title">Reserve Your Room</h1>
          <p className="page-header-desc">
            Enter your details and review live pricing for your stay at {hotel.name}.
          </p>
        </div>
      </div>

      <div className="booking-content-container">
        <BookingForm hotel={hotel} initialStay={initialStay} onBookingSuccess={handleBookingSuccess} />
      </div>
    </div>
  );
};

export default Booking;

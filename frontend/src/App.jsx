import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import Compare from './pages/Compare';
import MyBookings from './pages/MyBookings';
import NotFound from './pages/NotFound';

// Helper to scroll to top whenever the route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <div className="app-layout">
      <ScrollToTop />
      <Navbar />
      <main className="main-content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/booking/:hotelId" element={<Booking />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/mybookings" element={<MyBookings />} />
          <Route path="/mybooking" element={<MyBookings />} />
          <Route path="/my-booking" element={<MyBookings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

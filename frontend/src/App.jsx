import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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

// New CIE-3 Feature Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import VerifyBooking from './pages/VerifyBooking';

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
    <AuthProvider>
      <div className="app-layout">
        <ScrollToTop />
        <Navbar />
        <main className="main-content-wrapper">
          <Routes>
            {/* Core Hospitality Discovery & Booking */}
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

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User & Verification Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route path="/verify-booking" element={<VerifyBooking />} />

            {/* Role-Protected Hotel Manager Console */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={['hotel_manager', 'admin']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Role-Protected Admin Console */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;

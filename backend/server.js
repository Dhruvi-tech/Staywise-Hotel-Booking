const express = require('express');
const cors = require('cors');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// Base status route
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'StayWise Hotel Booking & Comparison API is active.',
    tagline: 'Find. Compare. Book. Stay.'
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`
  });
});

// Centralized Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.'
  });
});

const fs = require('fs');
const path = require('path');

// Clean start: clear bookings when server starts so every run starts fresh
try {
  const bookingsPath = path.join(__dirname, 'data', 'bookings.json');
  fs.writeFileSync(bookingsPath, JSON.stringify([], null, 2), 'utf-8');
} catch (err) {
  console.error('Could not initialize bookings.json', err);
}

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`StayWise Backend Server Running!`);
  console.log(`Port: http://localhost:${PORT}`);
  console.log(`Hotels API: http://localhost:${PORT}/api/hotels`);
  console.log(`Bookings API: http://localhost:${PORT}/api/bookings`);
  console.log(`=========================================`);
});

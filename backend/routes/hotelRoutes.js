const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const hotelsFilePath = path.join(__dirname, '..', 'data', 'hotels.json');

// Helper to read hotels JSON safely
const getHotelsData = () => {
  const fileData = fs.readFileSync(hotelsFilePath, 'utf-8');
  return JSON.parse(fileData);
};

// GET /api/hotels - Get all hotels
router.get('/', (req, res) => {
  try {
    const hotels = getHotelsData();
    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to load hotels from server.'
    });
  }
});

// GET /api/hotels/:id - Get single hotel by ID
router.get('/:id', (req, res) => {
  try {
    const hotels = getHotelsData();
    const hotel = hotels.find((h) => h.id === req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel with ID "${req.params.id}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    console.error(`Error fetching hotel ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving hotel details.'
    });
  }
});

module.exports = router;

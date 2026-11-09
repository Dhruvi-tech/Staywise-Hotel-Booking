const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hotel = require('../models/Hotel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staywise_db';

const seedHotels = async () => {
  try {
    console.log('Connecting to MongoDB for hotel data migration...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully to:', mongoose.connection.name);

    const hotelsFilePath = path.join(__dirname, '..', 'data', 'hotels.json');
    if (!fs.existsSync(hotelsFilePath)) {
      throw new Error(`Data file not found at ${hotelsFilePath}`);
    }

    const rawData = fs.readFileSync(hotelsFilePath, 'utf-8');
    const hotels = JSON.parse(rawData);

    console.log(`Loaded ${hotels.length} hotel records from hotels.json.`);

    if (!Array.isArray(hotels) || hotels.length === 0) {
      throw new Error('No hotel records found to import.');
    }

    // Build idempotent bulkWrite operations
    const bulkOps = hotels.map((item) => {
      const customId = item.id || item.customId;
      if (!customId) {
        throw new Error(`Hotel missing ID: ${JSON.stringify(item)}`);
      }

      const hotelDoc = {
        customId: customId,
        name: item.name,
        location: item.location,
        address: item.address || `${item.name}, ${item.location}`,
        tagline: item.tagline || '',
        description: item.description || 'Experience curated luxury and world-class hospitality.',
        price: Number(item.price) || 5000,
        rating: Number(item.rating) || 4.5,
        reviewsCount: Number(item.reviewsCount || item.reviews || 0),
        images: Array.isArray(item.images) && item.images.length > 0
          ? item.images
          : item.image
            ? [item.image]
            : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
        amenities: Array.isArray(item.amenities) ? item.amenities : ['Wi-Fi', 'Breakfast', 'Swimming Pool'],
        roomType: item.roomType || 'Deluxe Room',
        featured: Boolean(item.featured),
        availableRooms: item.availableRooms !== undefined ? Number(item.availableRooms) : 10
      };

      return {
        updateOne: {
          filter: { customId: customId },
          update: { $set: hotelDoc },
          upsert: true
        }
      };
    });

    const result = await Hotel.bulkWrite(bulkOps);

    console.log('--- HOTEL MIGRATION COMPLETED SUCCESSFULLY ---');
    console.log(`Matched Existing:  ${result.matchedCount}`);
    console.log(`Modified Existing: ${result.modifiedCount}`);
    console.log(`Upserted New:      ${result.upsertedCount}`);
    console.log(`Total In Database: ${await Hotel.countDocuments()}`);
    console.log('----------------------------------------------');

    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Hotel seeding failed:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedHotels();

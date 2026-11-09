const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

// @desc    Get all hotels with search, filter, sort & pagination
// @route   GET /api/hotels
// @access  Public
const getHotels = async (req, res, next) => {
  try {
    const {
      search,
      location,
      city,
      minPrice,
      maxPrice,
      minRating,
      amenities,
      roomType,
      featured,
      sort,
      page,
      limit
    } = req.query;

    const query = {};

    // 1. Text Search across Name, Location, Tagline
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { location: searchRegex },
        { tagline: searchRegex }
      ];
    }

    // 2. City / Location Filter
    const targetLocation = location || city;
    if (targetLocation && targetLocation.trim()) {
      query.location = new RegExp(`^${targetLocation.trim()}$`, 'i');
    }

    // 3. Price Range Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && !isNaN(minPrice)) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && !isNaN(maxPrice)) query.price.$lte = Number(maxPrice);
    }

    // 4. Star Rating Filter
    if (minRating !== undefined && !isNaN(minRating)) {
      query.rating = { $gte: Number(minRating) };
    }

    // 5. Featured Filter
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    // 6. Room Type Filter
    if (roomType && roomType.trim()) {
      query.roomType = new RegExp(roomType.trim(), 'i');
    }

    // 7. Amenities Filter (comma-separated or array)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim()).filter(Boolean);

      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    // 8. Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price-low' || sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high' || sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'rating-high' || sort === 'rating_desc') {
      sortOption = { rating: -1 };
    } else if (sort === 'popular') {
      sortOption = { reviewsCount: -1, rating: -1 };
    }

    // Pagination (optional: if limit is passed, paginate; else return full catalog for backwards compatibility)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 0; // 0 = all
    const skip = (pageNum - 1) * limitNum;

    const total = await Hotel.countDocuments(query);

    let hotelsQuery = Hotel.find(query).sort(sortOption);
    if (limitNum > 0) {
      hotelsQuery = hotelsQuery.skip(skip).limit(limitNum);
    }

    const hotels = await hotelsQuery;

    // Map Mongoose documents to ensure `id` is present for frontend compatibility
    const mappedHotels = hotels.map((h) => {
      const obj = h.toObject();
      obj.id = obj.customId || obj._id.toString();
      return obj;
    });

    res.status(200).json({
      success: true,
      count: mappedHotels.length,
      total,
      page: limitNum > 0 ? pageNum : 1,
      pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
      data: mappedHotels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hotel by Mongo ID or customId
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { customId: id }
      ]
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel with identifier "${id}" not found.`
      });
    }

    const hotelObj = hotel.toObject();
    hotelObj.id = hotelObj.customId || hotelObj._id.toString();

    res.status(200).json({
      success: true,
      data: hotelObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new hotel
// @route   POST /api/hotels
// @access  Private (Admin, Hotel Manager)
const createHotel = async (req, res, next) => {
  try {
    const {
      customId,
      name,
      location,
      address,
      tagline,
      description,
      price,
      rating,
      images,
      amenities,
      roomType,
      featured,
      availableRooms
    } = req.body;

    if (!name || !location || !address || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, location, address, description, and price are required fields.'
      });
    }

    // Auto-generate customId if not provided
    const assignedCustomId = customId && customId.trim()
      ? customId.trim()
      : `hotel-${Date.now()}`;

    // Verify customId uniqueness
    const existing = await Hotel.findOne({ customId: assignedCustomId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Hotel with ID "${assignedCustomId}" already exists.`
      });
    }

    const hotel = await Hotel.create({
      customId: assignedCustomId,
      name: name.trim(),
      location: location.trim(),
      address: address.trim(),
      tagline: tagline ? tagline.trim() : '',
      description: description.trim(),
      price: Number(price),
      rating: rating ? Number(rating) : 4.5,
      images: images && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: amenities || ['Wi-Fi', 'Breakfast', 'Swimming Pool', 'Air Conditioning'],
      roomType: roomType || 'Luxury Deluxe Room',
      featured: Boolean(featured),
      availableRooms: availableRooms !== undefined ? Number(availableRooms) : 10,
      createdBy: req.user._id
    });

    const hotelObj = hotel.toObject();
    hotelObj.id = hotelObj.customId;

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully!',
      data: hotelObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a hotel
// @route   PUT /api/hotels/:id
// @access  Private (Admin, or Hotel Manager who created it)
const updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { customId: id }
      ]
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel with ID "${id}" not found.`
      });
    }

    // Enforce ownership: Manager can only update their own hotels; Admin can update any
    if (req.user.role === 'hotel_manager') {
      if (!hotel.createdBy || hotel.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only update hotels managed by your account.'
        });
      }
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      hotel._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    const hotelObj = updatedHotel.toObject();
    hotelObj.id = hotelObj.customId || hotelObj._id.toString();

    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully!',
      data: hotelObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Admin only)
const deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { customId: id }
      ]
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel with ID "${id}" not found.`
      });
    }

    // Safeguard: Check if active confirmed bookings exist
    const activeBookings = await Booking.countDocuments({
      hotel: hotel._id,
      status: 'Confirmed'
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete hotel: ${activeBookings} active confirmed reservation(s) exist for this property.`
      });
    }

    await Hotel.findByIdAndDelete(hotel._id);

    res.status(200).json({
      success: true,
      message: `Hotel "${hotel.name}" was successfully removed.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
};

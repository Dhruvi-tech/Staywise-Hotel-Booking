const Staff = require('../models/Staff');
const Hotel = require('../models/Hotel');

// Initial curated staff seeds for initial manager demo
const defaultStaffList = [
  {
    staffId: 'STF-101',
    name: 'Vikramaditya Rathore',
    email: 'v.rathore@staywise-hospitality.com',
    phone: '+91 98201 11223',
    department: 'Management',
    role: 'General Hotel Manager',
    shift: 'Morning',
    status: 'On Duty',
    hotelName: 'The Oberoi Amarvilas, Agra',
    salary: 85000,
    emergencyContact: '+91 98201 99881'
  },
  {
    staffId: 'STF-102',
    name: 'Ananya Deshmukh',
    email: 'a.deshmukh@staywise-hospitality.com',
    phone: '+91 98112 33445',
    department: 'Front Desk',
    role: 'Chief Guest Relations Officer',
    shift: 'Morning',
    status: 'On Duty',
    hotelName: 'The Taj Mahal Palace, Mumbai',
    salary: 52000,
    emergencyContact: '+91 98112 55667'
  },
  {
    staffId: 'STF-103',
    name: 'Rahul K. Menon',
    email: 'r.menon@staywise-hospitality.com',
    phone: '+91 97401 55667',
    department: 'Concierge',
    role: 'Head Luxury Concierge (Les Clefs d\'Or)',
    shift: 'Morning',
    status: 'On Duty',
    hotelName: 'The Leela Palace, Bengaluru',
    salary: 58000,
    emergencyContact: '+91 97401 88990'
  },
  {
    staffId: 'STF-104',
    name: 'Pooja Bhattacharya',
    email: 'p.bhatt@staywise-hospitality.com',
    phone: '+91 98301 77889',
    department: 'Housekeeping',
    role: 'Executive Housekeeping Director',
    shift: 'Evening',
    status: 'Active',
    hotelName: 'ITC Grand Chola, Chennai',
    salary: 48000,
    emergencyContact: '+91 98301 22334'
  },
  {
    staffId: 'STF-105',
    name: 'Chef Devendra Rawat',
    email: 'd.rawat@staywise-hospitality.com',
    phone: '+91 98991 88990',
    department: 'Food & Beverage',
    role: 'Executive Master Chef',
    shift: 'Evening',
    status: 'On Duty',
    hotelName: 'Rambagh Palace, Jaipur',
    salary: 75000,
    emergencyContact: '+91 98991 11223'
  },
  {
    staffId: 'STF-106',
    name: 'Captain Jaswant Singh',
    email: 'j.singh@staywise-hospitality.com',
    phone: '+91 98711 22334',
    department: 'Security',
    role: 'Chief Security Officer',
    shift: 'Night',
    status: 'Active',
    hotelName: 'Taj Lake Palace, Udaipur',
    salary: 45000,
    emergencyContact: '+91 98711 44556'
  },
  {
    staffId: 'STF-107',
    name: 'Suresh Nambiar',
    email: 's.nambiar@staywise-hospitality.com',
    phone: '+91 94471 33445',
    department: 'Maintenance',
    role: 'Chief Property Engineer',
    shift: 'Morning',
    status: 'On Duty',
    hotelName: 'Kumarakom Lake Resort, Kerala',
    salary: 46000,
    emergencyContact: '+91 94471 66778'
  },
  {
    staffId: 'STF-108',
    name: 'Meera Sen',
    email: 'm.sen@staywise-hospitality.com',
    phone: '+91 98311 99001',
    department: 'Front Desk',
    role: 'VIP VIP Concierge Specialist',
    shift: 'Evening',
    status: 'On Leave',
    hotelName: 'The Imperial, New Delhi',
    salary: 42000,
    emergencyContact: '+91 98311 22334'
  }
];

// Seed initial staff records if database is empty
const ensureStaffSeeded = async (userId) => {
  try {
    const count = await Staff.countDocuments();
    if (count === 0) {
      const docs = defaultStaffList.map((item) => ({
        ...item,
        createdBy: userId || null
      }));
      await Staff.insertMany(docs);
    }
  } catch (err) {
    console.error('Error auto-seeding staff roster:', err.message);
  }
};

// @desc    Get staff members with filters, search, and roster stats
// @route   GET /api/staff
// @access  Private (Hotel Manager & Admin)
const getStaffList = async (req, res, next) => {
  try {
    await ensureStaffSeeded(req.user._id);

    const { department, shift, status, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (shift && shift !== 'All') {
      query.shift = shift;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { staffId: searchRegex },
        { role: searchRegex },
        { hotelName: searchRegex },
        { phone: searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const [staff, total, stats] = await Promise.all([
      Staff.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Staff.countDocuments(query),
      Staff.aggregate([
        {
          $group: {
            _id: null,
            totalStaff: { $sum: 1 },
            onDuty: {
              $sum: { $cond: [{ $eq: ['$status', 'On Duty'] }, 1, 0] }
            },
            onLeave: {
              $sum: { $cond: [{ $eq: ['$status', 'On Leave'] }, 1, 0] }
            },
            active: {
              $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const rosterStats = stats[0] || { totalStaff: 0, onDuty: 0, onLeave: 0, active: 0 };

    res.status(200).json({
      success: true,
      count: staff.length,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / pageSize),
      stats: rosterStats,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single staff member by ID
// @route   GET /api/staff/:id
// @access  Private (Hotel Manager & Admin)
const getStaffById = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found.'
      });
    }
    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new staff member
// @route   POST /api/staff
// @access  Private (Hotel Manager & Admin)
const createStaff = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      role,
      shift,
      status,
      hotelName,
      salary,
      emergencyContact
    } = req.body;

    if (!name || !phone || !department || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide staff name, phone, department, and role/designation.'
      });
    }

    // Generate unique staff ID e.g. STF-4821
    const count = await Staff.countDocuments();
    const staffId = `STF-${100 + count + Math.floor(Math.random() * 900)}`;

    const newStaff = await Staff.create({
      staffId,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      phone: phone.trim(),
      department,
      role: role.trim(),
      shift: shift || 'Morning',
      status: status || 'Active',
      hotelName: hotelName ? hotelName.trim() : 'StayWise Luxury Properties',
      salary: salary ? Number(salary) : 40000,
      emergencyContact: emergencyContact ? emergencyContact.trim() : '',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: `Staff member ${newStaff.name} (${newStaff.staffId}) registered successfully!`,
      data: newStaff
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff member record
// @route   PUT /api/staff/:id
// @access  Private (Hotel Manager & Admin)
const updateStaff = async (req, res, next) => {
  try {
    let staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found.'
      });
    }

    staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Staff record updated successfully.',
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete staff record
// @route   DELETE /api/staff/:id
// @access  Private (Hotel Manager & Admin)
const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found.'
      });
    }

    await Staff.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Staff record ${staff.name} (${staff.staffId}) removed.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffList,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};

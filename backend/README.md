# StayWise — Backend REST API Documentation
**CS3301 Full Stack Development CIE-3 Implementation**

StayWise is an enterprise-grade MERN stack hotel discovery, comparison, and reservation system. This backend is engineered with **Node.js, Express.js, MongoDB Atlas (Mongoose ODM)**, and **JWT role-based authentication**.

---

## 🏛️ System Architecture

```
backend/
├── config/
│   └── db.js                 # MongoDB connection handler with auto-reconnect
├── controllers/
│   ├── authController.js     # Register, Login, GetMe, Logout
│   ├── userController.js     # Profile, Password, Wishlist, Recently Viewed
│   ├── hotelController.js    # CRUD, Search, Filter, Sort, Pagination
│   ├── bookingController.js  # Live pricing, capacity, verify, cancel, modify
│   ├── reviewController.js   # Verified stay review submissions & aggregations
│   ├── adminController.js    # Executive analytics & user management
│   └── notificationController.js # Real-time in-app user notifications
├── middleware/
│   ├── authMiddleware.js     # JWT Bearer validation & user hydration
│   ├── roleMiddleware.js     # Role-based access control (RBAC)
│   └── errorMiddleware.js    # 404 & centralized structured error handling
├── models/
│   ├── User.js               # User accounts with bcrypt hashing
│   ├── Hotel.js              # 84 curated luxury hotels with customId index
│   ├── Booking.js            # Permanent reservations with SW-BK-XXXXX refs
│   ├── Review.js             # Verified reviews with auto rating updates
│   └── Notification.js       # Transactional user notifications
├── routes/
│   ├── authRoutes.js         # /api/auth/*
│   ├── userRoutes.js         # /api/users/*
│   ├── hotelRoutes.js        # /api/hotels/*
│   ├── bookingRoutes.js      # /api/bookings/*
│   ├── reviewRoutes.js       # /api/reviews/*
│   ├── adminRoutes.js        # /api/admin/*
│   └── notificationRoutes.js # /api/notifications/*
├── scripts/
│   ├── seedHotels.js         # Idempotent 84-hotel database migration
│   ├── seedAdmin.js          # Admin, manager & guest seeder
│   └── testSuite.js          # 24-point automated test runner
├── utils/
│   ├── bookingCalculator.js  # Nights, pricing formula & capacity enforcement
│   └── generateToken.js      # JWT signing utility
├── data/
│   ├── hotels.json           # Master 84-hotel catalog
│   └── bookings.json         # Legacy fallback
├── .env.example              # Sample environment template
├── package.json
└── server.js                 # Express application entrypoint
```

---

## ⚙️ Environment Variables

Create `.env` in `backend/` using `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/staywise_db
JWT_SECRET=staywise_super_secure_jwt_secret_key_2026_cie3_edition
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000

ADMIN_NAME=StayWise Administrator
ADMIN_EMAIL=admin@staywise.com
ADMIN_PASSWORD=Admin@123456
ADMIN_PHONE=+91 98765 43210
```

---

## 🚀 Database Migration & Seeding

### 1. Seed All 84 Curated Hotels
```bash
npm run seed:hotels
```
* **Idempotent**: Uses `bulkWrite` with `upsert: true` on `customId` (`hotel-1` to `hotel-84`). Running multiple times never creates duplicates.
* Preserves all pricing, ratings, high-res Unsplash galleries, taglines, and room specifications.

### 2. Seed Default Accounts
```bash
npm run seed:admin
```
Seeded credentials for immediate evaluation:
* **Administrator**: `admin@staywise.com` / `Admin@123456`
* **Hotel Manager**: `manager@staywise.com` / `Manager@123456`
* **Verified Guest**: `guest@staywise.com` / `Guest@123456`

### 3. Run Both Seeders
```bash
npm run seed:all
```

---

## 🧪 Automated Testing

Execute the comprehensive 24-point integration test suite:

```bash
npm test
```

All 24 test cases cover:
1. Registration (Guest & Manager)
2. Duplicate email rejection (400)
3. Role-based login and JWT issuance
4. Password protection & profile updates
5. 84-hotel catalog retrieval & customId lookups
6. Destination search & multi-parameter filtering
7. Pricing formula validation:
   $$\text{Subtotal} = \text{Price} \times \text{Nights} \times \text{Rooms}$$
   $$\text{Total Amount} = \text{Subtotal} + ₹500$$
8. Room occupancy rule enforcement ($\max 2\text{ adults}, 1\text{ child/room}$)
9. Digital verification (`SW-BK-XXXXX`)
10. Booking cancellation & modification
11. Admin dashboard MongoDB aggregations

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new guest or hotel manager account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve current user profile |
| `POST` | `/api/auth/logout` | Public | Stateless session logout |

### User Profile (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/profile` | Private | Get profile details with reservation stats |
| `PUT` | `/api/users/profile` | Private | Update name and phone |
| `PUT` | `/api/users/change-password` | Private | Change password with bcrypt verification |
| `GET` | `/api/users/wishlist` | Private | Get user's saved wishlist hotels |
| `POST` | `/api/users/wishlist/:id` | Private | Add property to wishlist |
| `DELETE` | `/api/users/wishlist/:id` | Private | Remove property from wishlist |

### Hotels (`/api/hotels`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/hotels` | Public | List hotels with search, city, price & rating filters |
| `GET` | `/api/hotels/:id` | Public | Fetch single hotel by customId (`hotel-1`) or ObjectId |
| `POST` | `/api/hotels` | Manager / Admin | Create new hotel listing |
| `PUT` | `/api/hotels/:id` | Manager / Admin | Update hotel listing |
| `DELETE` | `/api/hotels/:id` | Admin | Delete listing (safeguarded against active bookings) |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Private | Create reservation with server-computed pricing |
| `GET` | `/api/bookings/my` | Private | Retrieve logged-in user's reservations |
| `GET` | `/api/bookings/:id` | Private | Get reservation details (ownership verified) |
| `PATCH` | `/api/bookings/:id/cancel` | Private | Cancel reservation with reason |
| `PUT` | `/api/bookings/:id/modify` | Private | Modify dates and rooms (live recalculation) |
| `GET` | `/api/bookings/verify/:reference` | Public | Verify digital booking certificate |
| `GET` | `/api/bookings/admin/all` | Admin | View all system reservations |

### Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reviews/:hotelId` | Public | Get all reviews for a hotel |
| `POST` | `/api/reviews` | Private | Submit verified review (verified stay required) |

### Admin Intelligence (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin | Real-time MongoDB aggregations (revenue, destinations) |
| `GET` | `/api/admin/users` | Admin | List all users with pagination and search |
| `PUT` | `/api/admin/users/:id/role` | Admin | Update user membership role |

---

## 🔒 Security Best Practices
- **Helmet**: Secures HTTP response headers against clickjacking, sniffing, and XSS.
- **Rate Limiting**: Protects auth routes against brute-force login attacks.
- **Server-Side Pricing**: Prices and subtotals are never trusted from the client.
- **Password Protection**: Passwords hashed with bcrypt (salt rounds = 10); never returned in responses.

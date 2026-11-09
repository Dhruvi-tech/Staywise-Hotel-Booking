<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0b0b0e,45:3a3220,100:D4AF37&height=250&section=header&text=StayWise&fontSize=84&fontColor=fbf8f2&fontAlignY=36&desc=Find.%20Compare.%20Book.%20Stay.&descSize=22&descAlignY=58&animation=fadeIn" width="100%" alt="StayWise" />

<a href="#-curated-gallery">
  <img src="https://readme-typing-svg.demolab.com?font=Playfair+Display&weight=600&size=24&duration=3200&pause=900&color=D4AF37&center=true&vCenter=true&width=780&height=50&lines=Handcrafted+boutique+sanctuaries+across+India;Live+stay+budgeting+%E2%80%94+exact+to+the+rupee;Side-by-side+comparison+with+Best+Value+scoring;3-Tier+RBAC%3A+Guest%2C+Manager+Staff+Roster+%26+Admin;Real-Time+Dynamic+3-Code+Demo+Verification" alt="StayWise highlights" />
</a>

<br />

<p>
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black&labelColor=18181b" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=18181b" alt="Vite 5" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=18181b" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.21-ffffff?style=for-the-badge&logo=express&logoColor=white&labelColor=18181b" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white&labelColor=18181b" alt="MongoDB Atlas" />
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%20bcryptjs-FF6F00?style=for-the-badge&logo=jsonwebtokens&logoColor=white&labelColor=18181b" alt="JWT Auth" />
  <img src="https://img.shields.io/badge/Design-Editorial_Luxe-D4AF37?style=for-the-badge&labelColor=18181b" alt="Editorial Luxe" />
  <img src="https://img.shields.io/badge/Tests-24%2F24_Passing-10b981?style=for-the-badge&logo=jest&logoColor=white&labelColor=18181b" alt="24/24 Tests Passing" />
</p>

<p>
  <a href="#-the-essence"><b>Essence</b></a> &nbsp;◆&nbsp;
  <a href="#-signature-capabilities"><b>Capabilities</b></a> &nbsp;◆&nbsp;
  <a href="#-role-based-differentiation-rbac"><b>RBAC Roles</b></a> &nbsp;◆&nbsp;
  <a href="#-real-time-3-code-verification-system"><b>Dynamic Verification</b></a> &nbsp;◆&nbsp;
  <a href="#-system-architecture"><b>Architecture</b></a> &nbsp;◆&nbsp;
  <a href="#-evaluator-quick-start"><b>Evaluator Quick Start</b></a> &nbsp;◆&nbsp;
  <a href="#-automated-test-suite"><b>Test Suite</b></a>
</p>

</div>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0b0b0e,50:D4AF37,100:0b0b0e&height=3" width="100%" alt="" />

## ✦ The Essence

**StayWise** is a bespoke full-stack luxury hospitality reservation and comparison platform engineered for **CS3301 Full Stack Development (CIE-3)**. It combines a timeless **2026 Editorial Luxury** aesthetic (*warm alabaster, obsidian ink, champagne-gold accents*) with a high-throughput, enterprise-grade **Node.js, Express, MongoDB (Mongoose), and React 18** architecture.

<div align="center">

| 🏛️ Stays | 💰 Pricing Model | ⚖️ Comparison | 🛏️ Capacity Guard | 🛡️ Security & RBAC | 🧪 Verification |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **84 Curated Hotels** | **₹ Exact to the Rupee** | **3-Property Matrix** | **Max 2 + 1 / Room** | **3-Tier RBAC** | **24/24 Passing** |
| 7 Indian Destinations | $(\text{Rate} \times \text{Nights} \times \text{Rooms}) + ₹500$ | Algorithmic Best Value | 1-Click Auto Upgrade | Guest · Manager · Admin | E2E Integration Suite |

</div>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0b0b0e,50:D4AF37,100:0b0b0e&height=3" width="100%" alt="" />

## ✦ Signature Capabilities

### 1. ⚖️ Algorithmic 3-Hotel Comparison Matrix
Compare up to 3 hotels side-by-side across pricing, customer ratings, room tiers, destination landmarks, and six amenities. An automated **Best Value** scoring engine balances rating against price and amenity depth:
$$\text{Best Value Score} = \left(\frac{\text{Rating}}{\text{Nightly Price}} \times 10{,}000\right) + \text{Amenities Count}$$

### 2. ⏱️ Stay Duration & Exact Budget Precision
Replaces error-prone date pickers with an intuitive trip duration stepper (*3, 7, 10, 14 nights*). Checkout dates and totals are calculated atomically:
$$\text{Grand Total} = (\text{Nightly Rate} \times \text{Nights} \times \text{Rooms}) + \text{₹500 (Service & Booking Fee)}$$

### 3. 👥 Strict Hospitality Capacity Guard
Hospitality standards strictly enforced: **maximum 2 adults and 1 child per room**.
$$\text{Required Rooms} = \max\left(1,\ \left\lceil \tfrac{\text{Adults}}{2} \right\rceil,\ \text{Children},\ \left\lceil \tfrac{\text{Adults} + \text{Children}}{3} \right\rceil\right)$$
- Instant inline capacity warnings with a **1-click auto-upgrade** button (`➕ Book N Rooms`).
- Independent server-side validation rejecting non-compliant requests with `400 Bad Request`.

### 4. 🎯 Multi-Variable Real-Time Filtering
- **Dynamic Price Range Slider:** ₹1,000 to ₹12,000 with real-time reactive counts.
- **Star Rating Tiers:** Any, 3.5★+, 4.0★+, 4.5★+, 4.8★+.
- **Amenity Filters:** Wi-Fi, Swimming Pool, Spa, Ocean View, Fine Dining, Fitness Center, Airport Shuttle.
- **Smart Editorial Badges:** *Best Value*, *Top Rated*, *Heritage Luxury*, *Trending*.

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0b0b0e,50:D4AF37,100:0b0b0e&height=3" width="100%" alt="" />

## ✦ Role-Based Differentiation (RBAC)

StayWise implements strict, distinct authorization boundaries across 3 roles:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STAYWISE ROLE-BASED ACCESS CONTROL                    │
├───────────────────────┬──────────────────────────┬──────────────────────────┤
│    👤 GUEST TRAVELER   │     🏨 HOTEL MANAGER     │     🛡️ MASTER ADMIN      │
├───────────────────────┼──────────────────────────┼──────────────────────────┤
│ • Browse 84 Stays     │ • Dedicated Portal       │ • Executive Dashboard    │
│ • Filter & Compare    │   (/manager)             │   (/admin)               │
│ • Book Rooms          │ • Staff Records Roster   │ • MongoDB Aggregations   │
│ • Manage Reservations │   (CRUD & Status Toggles)│ • Hotel CRUD Governance  │
│ • Digital Pass Check  │ • Managed Properties     │ • User Role Management   │
│ • Profile & Wishlists │ • Property Bookings      │ • Staff System Access    │
└───────────────────────┴──────────────────────────┴──────────────────────────┘
```

### 🏨 Dedicated Hotel Manager Portal (`/manager`)
1. **Staff & Personnel Records:**
   - Complete live roster with Staff ID, Full Name, Department (Concierge, Housekeeping, Culinary, Front Desk, Security), Role, Shift (Morning, Evening, Night), and Salary.
   - Status toggle between **Active** and **On Leave**.
   - Search by name/ID, department filtering, and **+ Add Staff Member** modal.
2. **Managed Properties & Inventory:** Live preview of managed hotels and room stock.
3. **Property Reservations:** Stream of incoming guest reservations.

### 🛡️ Master Administrator Console (`/admin`)
- **Executive MongoDB Aggregations:** Total platform revenue, booking counts, active traveler accounts, and average stay duration computed on the fly.
- **Hotel Catalog Governance:** Add new properties, update pricing, upload imagery, and soft-delete listings.
- **Direct Staff Management:** Single-click deep link to manage hotel personnel.

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0b0b0e,50:D4AF37,100:0b0b0e&height=3" width="100%" alt="" />

## ✦ Real-Time 3-Code Verification System

During account creation (or demo evaluation sign-up), the server generates **3 completely randomized, distinct 6-digit verification codes** every single time:

```text
                  [ User Registration / Demo Sign-Up ]
                                   │
                                   ▼
          ┌─────────────────────────────────────────────────┐
          │  Server Generates 3 Unique Random 6-Digit Codes │
          └────────────────────────┬────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
   👤 Guest Code             🏨 Manager Code            🛡️ Admin Code
  (e.g., "473517")          (e.g., "660198")          (e.g., "438445")
         │                         │                         │
         ▼                         ▼                         ▼
  Verifies as Guest         Verifies & Promotes       Verifies & Promotes
  Traveler Account          to Hotel Manager          to Master Administrator
```

- **Different Every Time:** Every registration or "Resend Code" call issues 3 brand-new, non-overlapping codes.
- **1-Click Auto-Fill:** Evaluators can click on any of the 3 code badges to instantly populate the verification input.
- **Single 6-Digit Input:** Rock-solid unified input (`maxLength={6}`) preventing keyboard focus traps.

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0b0b0e,50:D4AF37,100:0b0b0e&height=3" width="100%" alt="" />

## ✦ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT 18 CLIENT (Vite)                          │
│                         http://localhost:3000                          │
│                                                                        │
│   • AuthContext (JWT & Verification)    • React Router DOM v6          │
│   • Single-Box Dynamic OTP Input        • Pure CSS Editorial Luxe      │
│   • Manager Staff Roster Module         • Admin Aggregation Dashboards │
│   • Live Rupee Budget Estimator         • ErrorBoundary Fallback       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         HTTP REST + Bearer JWT
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       EXPRESS 4 REST API SERVER                        │
│                         http://localhost:5000                          │
│                                                                        │
│   • /api/auth       (Register, 3-Code Verify, Resend, JWT Login, Me)   │
│   • /api/hotels     (84 Catalog Stays, Search, Multi-Filter, Admin)    │
│   • /api/bookings   (Atomic Booking, Capacity Validation, Cancel)      │
│   • /api/staff      (Staff Roster CRUD, Shift & Status Management)     │
│   • /api/admin      (Executive Aggregation Metrics, User Governance)   │
│   • /api/users      (Profile Management, Password Change)              │
│   • /api/reviews    (Guest Feedback & Ratings)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                               Mongoose ODM
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    MONGODB DATABASE (staywise_db)                      │
│                                                                        │
│   • hotels (84 stays)    • users (3-tier roles & dynamic OTP codes)    │
│   • bookings (tickets)   • staffs (hotel staff roster records)         │
│   • reviews              • notifications                               │
└────────────────────────────────────────────────────────────────────────┘
```

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0b0b0e,50:D4AF37,100:0b0b0e&height=3" width="100%" alt="" />

## ✦ Evaluator Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB community service (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

---

### Step 1 · Clone & Configure Environment

```bash
git clone https://github.com/Dhruvi-tech/Staywise-Hotel-Booking.git
cd Staywise-Hotel-Booking
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/staywise_db
JWT_SECRET=staywise_super_secure_jwt_secret_key_2026_cie3_edition
CLIENT_URL=http://localhost:3000
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### Step 2 · Install Dependencies & Seed Database

```bash
# 1. Backend setup & seeding
cd backend
npm install

# Seed 84 luxury hotels idempotently
npm run seed:hotels

# Seed initial Administrator, Hotel Manager and Guest accounts
npm run seed:admin

# 2. Frontend setup
cd ../frontend
npm install
```

---

### Step 3 · Launch Applications

Open two terminal sessions:

**Terminal 1 (Backend API):**
```bash
cd backend
npm start
# ➜ Running on http://localhost:5000
# ➜ Health check: http://localhost:5000/api/health
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# ➜ Accessible at http://localhost:3000
```

---

### 🔑 Instant 1-Click Evaluator Access

You can sign in immediately using the **1-Click Demo** buttons on `http://localhost:3000/login` or test dynamic registration at `http://localhost:3000/register`:

| Role | Pre-Seeded Email | Password | Privileges & Entry Route |
|:---|:---|:---|:---|
| **Administrator** | `admin@staywise.com` | `Admin@123456` | Full system control, MongoDB aggregations, hotel CRUD (`/admin`) |
| **Hotel Manager** | `manager@staywise.com` | `Manager@123456` | Staff records roster, managed hotels & reservations (`/manager`) |
| **Guest Traveler** | `guest@staywise.com` | `Guest@123456` | Browse 84 hotels, compare, book, manage reservations (`/`) |

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0b0b0e,50:D4AF37,100:0b0b0e&height=3" width="100%" alt="" />

## ✦ Automated Test Suite

StayWise includes a comprehensive end-to-end integration test runner validating all 24 core API operations:

```bash
cd backend
npm test
```

### Test Suite Execution Output (24/24 Passing)
```text
==================================================
 STAYWISE CIE-3 COMPREHENSIVE TEST SUITE EXECUTION
 Target API: http://localhost:5000/api
==================================================

--- 1. Authentication & Role-Based Authorization ---
  ✓ PASS: TC01: Register New Guest Account
  ✓ PASS: TC02: Register New Hotel Manager Account
  ✓ PASS: TC03: Reject Duplicate Email Registration with 400
  ✓ PASS: TC04: Admin Login & Token Acquisition
  ✓ PASS: TC05: Guest Login & Token Acquisition
  ✓ PASS: TC06: Reject Invalid Login Credentials with 401
  ✓ PASS: TC07: Verify Authenticated Profile via /api/auth/me
  ✓ PASS: TC08: Stateless Logout Acknowledgement

--- 2. User Profile & Preferences ---
  ✓ PASS: TC09: Retrieve User Profile with Reservation Metrics
  ✓ PASS: TC10: Update User Profile Details
  ✓ PASS: TC11: Change User Password

--- 3. Hotel REST APIs ---
  ✓ PASS: TC12: Retrieve All Hotels (Total 84 Preserved)
  ✓ PASS: TC13: Search Hotels by Destination (Goa)
  ✓ PASS: TC14: Filter Hotels by Min Rating (4.8) & Max Price (10000)
  ✓ PASS: TC15: Retrieve Hotel by Legacy Custom ID ("hotel-1")
  ✓ PASS: TC16: Create New Hotel Property (Admin RBAC)

--- 4. Booking REST APIs ---
  ✓ PASS: TC17: Create Valid Reservation (Subtotal + ₹500 fee calculated on DB price)
  ✓ PASS: TC18: Reject Over-Capacity Reservation with 400 (4 adults in 1 room)
  ✓ PASS: TC19: Fetch User Bookings (GET /api/bookings/my)
  ✓ PASS: TC20: Modify Reservation Dates & Rooms (PUT /api/bookings/:id/modify)
  ✓ PASS: TC21: Public Digital Verification of Booking Reference
  ✓ PASS: TC22: Cancel Reservation with Reason (PATCH /api/bookings/:id/cancel)

--- 5. Admin Dashboard & Notifications ---
  ✓ PASS: TC23: Executive Dashboard MongoDB Aggregations
  ✓ PASS: TC24: Retrieve User In-App Notifications

==================================================
 TOTAL TESTS RUN: 24
 PASSED:         24
 FAILED:         0
 SUCCESS RATE:   100%
==================================================
```

---

### 📮 Postman Collection
Import `staywise_postman_collection.json` into Postman to execute all 24 end-to-end integration test cases with automated token extraction and test assertions.

<br />

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0b0b0e,50:3a3220,100:D4AF37&height=140&section=footer&text=Find.%20Compare.%20Book.%20Stay.&fontColor=fbf8f2&fontSize=26&fontAlignY=65&animation=twinkling" width="100%" alt="" />

<sub><b>StayWise</b> · CS3301 Full Stack Development (CIE-3)<br />React 18 · Vite · Express 4 · MongoDB & Mongoose · JWT Authentication</sub>

</div>

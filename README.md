# ResolveDesk — Enterprise Complaint Management System (Full-Stack MERN)

A complete, production-grade enterprise Complaint Management System built with **MongoDB**, **Express.js**, **React.js (Vite + Tailwind CSS)**, and **Node.js**.

---

## 1. Project Overview & Architecture

ResolveDesk enables employees to submit complaints, track their live resolution status, inspect audit timelines, and receive real-time notifications. Administrators can manage, filter, reassign, add internal notes, and resolve/reject complaints across the organization.

### Key Highlights
- **Real MERN Stack**: Built with Express REST API, MongoDB/Mongoose models, JWT authentication, and bcryptjs password hashing.
- **Role-Based Access Control (RBAC)**: Secure separation between `user` and `admin` roles on both frontend routes and backend APIs.
- **Complaint Lifecycle**: Comprehensive status states (`Pending` → `In Progress` → `Resolved` / `Rejected`) with full activity timeline auditing.
- **MongoDB Atlas & Local Support**: Connects seamlessly to MongoDB Atlas or local MongoDB instances via `MONGODB_URI`.
- **Zero-Dependency Fallback Engine**: If an external MongoDB instance is not configured, the built-in resilient in-memory database engine automatically activates with full Mongoose schema compatibility so the entire application is 100% testable out-of-the-box.

---

## 2. Directory Structure

```
complaint-management-system/
├── server/
│   ├── config/
│   │   └── db.ts                   # MongoDB connection & status inspection
│   ├── controllers/
│   │   ├── authController.ts       # Registration, login, session verification
│   │   ├── complaintController.ts  # Ticket submission, user complaints, details
│   │   ├── adminController.ts      # Admin dashboard metrics, updates, assignment
│   │   ├── notificationController.ts # User activity alerts
│   │   └── userController.ts       # Profile & password updates
│   ├── middleware/
│   │   ├── auth.ts                 # JWT verification & RBAC requireAdmin
│   │   ├── errorHandler.ts         # Centralized error handler
│   │   └── rateLimiter.ts          # Auth rate limiting
│   ├── models/
│   │   ├── User.ts                 # Mongoose User model
│   │   ├── Complaint.ts            # Mongoose Complaint model
│   │   ├── ComplaintActivity.ts    # Audit history timeline model
│   │   └── Notification.ts         # User notification model
│   ├── routes/
│   │   ├── authRoutes.ts           # /api/auth
│   │   ├── complaintRoutes.ts      # /api/complaints
│   │   ├── adminRoutes.ts          # /api/admin
│   │   ├── notificationRoutes.ts   # /api/notifications
│   │   └── userRoutes.ts           # /api/users
│   ├── services/
│   │   └── dbStore.ts              # Unified Mongoose & resilient data store
│   └── scripts/
│       └── seed.ts                 # Database seed script for MongoDB Atlas/Local
├── src/
│   ├── components/
│   │   ├── Navbar.tsx              # Top navigation, role toggle, notification bell
│   │   ├── Sidebar.tsx             # Enterprise left navigation & mobile drawer
│   │   ├── StatusBadge.tsx         # Clean status pill with dot indicators
│   │   ├── PriorityBadge.tsx       # Severity indicator badge
│   │   ├── Pagination.tsx          # Table pagination controls
│   │   ├── Timeline.tsx            # Complaint activity audit trail
│   │   └── DatabaseStatusModal.tsx # Live DB connection status modal
│   ├── context/
│   │   └── AuthContext.tsx         # JWT auth state & user session context
│   ├── layouts/
│   │   └── AppLayout.tsx           # Authenticated layout wrapper
│   ├── pages/
│   │   ├── Login.tsx               # Enterprise login with demo shortcuts
│   │   ├── Register.tsx            # Employee signup (enforced user role)
│   │   ├── Dashboard.tsx           # User complaint metrics & recent tickets
│   │   ├── SubmitComplaint.tsx     # Full complaint submission form
│   │   ├── MyComplaints.tsx        # Searchable, filterable, paginated table
│   │   ├── ComplaintDetails.tsx    # Details view, timeline, & admin console
│   │   ├── AdminDashboard.tsx      # Admin metrics, category/priority breakdowns
│   │   ├── AdminComplaints.tsx     # Organization-wide management console
│   │   ├── NotificationsPage.tsx   # Activity notifications list
│   │   ├── Profile.tsx             # Profile info & password change
│   │   └── NotFound.tsx            # 404 page
│   ├── services/
│   │   └── api.ts                  # Axios client with JWT interceptors
│   ├── App.tsx                     # React Router with RBAC guards
│   ├── index.css                   # Tailwind CSS imports
│   └── main.tsx                    # React DOM entry point
├── server.ts                       # Express server with Vite middleware integration
├── package.json                    # Full-stack dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build tool configuration
└── .env.example                    # Environment variable template
```

---

## 3. Pre-Seeded Enterprise Accounts

For immediate testing, the database is pre-seeded with two primary accounts:

| Role | Email | Password | Full Name |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@resolvedesk.com` | `Admin@123456` | Alexander Wright |
| **Staff / User** | `sarah.jenkins@acme.org` | `User@123456` | Sarah Jenkins |
| **Staff / User 2** | `david.chen@acme.org` | `User@123456` | David Chen |

> *Tip: You can use the "Instant Demo Credentials" buttons directly on the Login page or the "User Mode / Admin Mode" switchers in the top navigation bar to test both perspectives instantly.*

---

## 4. Setup & Running Locally

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Create a `.env` file in the project root:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/complaint_management
JWT_SECRET=super_secret_enterprise_jwt_key_2026_complaint_desk
JWT_EXPIRES_IN=7d
```

### Step 3: Start the Application
Run the full-stack server (starts Express backend + Vite frontend together):
```bash
npm run dev
```
Open your browser at: **`http://localhost:3000`**

### Step 4 (Optional): Seed Data to MongoDB
To seed or reset sample records into your local MongoDB or Atlas cluster:
```bash
npm run seed
```

---

## 5. Connecting MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a free shared cluster (e.g. M0 tier).
3. Under **Security → Database Access**, create a database user (e.g., `app_user` with password `SecurePassword123`).
4. Under **Security → Network Access**, add IP Address `0.0.0.0/0` (Allow Access from Anywhere).
5. Click **Connect → Drivers → Node.js** to copy your connection string.
6. Replace `<password>` and add the database name in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://app_user:SecurePassword123@cluster0.abcde.mongodb.net/complaint_management?retryWrites=true&w=majority
   ```
7. Restart the dev server (`npm run dev`) or run `npm run seed`. ResolveDesk will connect directly to Atlas.

---

## 6. REST API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user (`name`, `email`, `password`, `confirmPassword`). Always defaults to role `user`.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Verify session and return current user profile.

### Complaints (`/api/complaints`)
- `POST /api/complaints` — Submit a new complaint (generates reference #, e.g. `CMP-2026-1006`).
- `GET /api/complaints/my` — Retrieve user's submitted complaints with search, filtering, and pagination.
- `GET /api/complaints/dashboard-stats` — Get status counts and recent complaints for logged-in user.
- `GET /api/complaints/:id` — Get single complaint details and activity timeline (authorized for creator or admin).

### Admin Operations (`/api/admin`) *(Requires Admin Role)*
- `GET /api/admin/dashboard` — Global organization stats, category breakdown, priority distribution.
- `GET /api/admin/complaints` — View, search, and filter all complaints from all employees.
- `PATCH /api/admin/complaints/:id/status` — Change status (`Pending`, `In Progress`, `Resolved`, `Rejected`) and append resolution notes.
- `PATCH /api/admin/complaints/:id/assign` — Assign ticket to department or administrator.
- `POST /api/admin/complaints/:id/internal-note` — Record private internal staff notes.

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Fetch user's activity notifications.
- `PATCH /api/notifications/:id/read` — Mark notification as read.
- `PATCH /api/notifications/read-all` — Mark all notifications as read.

### Profile (`/api/users`)
- `GET /api/users/profile` — Fetch current user profile details.
- `PATCH /api/users/profile` — Update user's full name.
- `PATCH /api/users/change-password` — Change password after verifying current password.

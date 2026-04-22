# WEARMS 🛡️

**Women Emergency Alert & Response Management System**

WEARMS is a full-stack emergency response platform designed to help women trigger SOS alerts quickly and enable vigilance officers to manage, track, and resolve cases in a structured workflow.

It combines:
- a **React + Vite** frontend for users and officers,
- an **Express + Node.js** API backend,
- and a **MySQL** database with stored procedures, triggers, and analytical functions.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Repository Structure](#repository-structure)
6. [Database Design](#database-design)
7. [Setup Guide](#setup-guide)
8. [Environment Variables](#environment-variables)
9. [Running the Project](#running-the-project)
10. [API Reference](#api-reference)
11. [Case Lifecycle](#case-lifecycle)
12. [Validation and Build Status](#validation-and-build-status)
13. [Troubleshooting](#troubleshooting)
14. [Future Improvements](#future-improvements)

---

## Project Overview

WEARMS supports two major actor groups:

### 1) End Users
- Register and log in securely.
- Save emergency contacts.
- Trigger SOS alerts with GPS coordinates.
- Track case progress and response timeline.
- View personal alert and case history.

### 2) Vigilance Team (Officers/Admin)
- Secure officer login.
- View incoming, pending, resolved, and closed cases.
- Assign officers to cases.
- Update case statuses through each response stage.
- Manage officer availability.
- Monitor operational reports and analytics.

The core business logic is reinforced at the database layer using procedures and triggers, ensuring consistency even when multiple services interact with the same data.

---

## Key Features

- 🚨 **One-tap SOS trigger** with location capture.
- 🔐 **JWT-based authentication** for users and officers.
- 👮 **Officer assignment workflow** with active/inactive control.
- 📌 **Case timeline tracking** through status history.
- 📊 **Operational reports** (alerts/day, status distribution, cases/officer, response metrics).
- 🧠 **Database-driven automation**:
  - auto-creation of cases from SOS alerts,
  - automatic status-history logging,
  - automatic assignment deactivation on case closure.

---

## System Architecture

```text
Frontend (React + Vite)
    |
    | HTTP/JSON (Axios)
    v
Backend API (Express.js)
    |
    | SQL (mysql2/promise)
    v
MySQL Database
  - Relational schema (7 primary tables)
  - Stored procedures
  - Triggers
  - SQL functions
```

Backend route groups:
- `/api/auth` -> registration and login
- `/api/user` -> profile and contacts
- `/api/sos` -> alert creation and case tracking
- `/api/vigilance` -> case operations, officer management, reporting

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router, Axios, Recharts, TailwindCSS |
| Backend | Node.js, Express 4, mysql2, bcryptjs, jsonwebtoken, express-validator |
| Database | MySQL 8+ |
| Auth | JWT + role-aware middleware |

---

## Repository Structure

```text
Women-Emergency-Alert-Response-Management-System/
├── README.md
├── backend/
│   ├── app.js                  # Express app setup + middleware + route mounting
│   ├── server.js               # API server entrypoint
│   ├── config/db.js            # MySQL connection pool
│   ├── middleware/auth.js      # JWT verification and role authorization
│   ├── routes/
│   │   ├── auth.js             # User and officer authentication routes
│   │   ├── user.js             # User profile + emergency contacts
│   │   ├── sos.js              # SOS, case status/history, dashboard stats
│   │   └── vigilance.js        # Case handling, officer management, reports
│   ├── init-db.js              # Helper importer for SQL routines/triggers
│   ├── verify-api.js
│   ├── .env.example
│   └── package.json
├── database/
│   ├── schema.sql              # Core schema + seed officers
│   ├── procedures.sql          # Business procedures + report procedures
│   ├── triggers.sql            # Automatic lifecycle triggers
│   ├── functions.sql           # Analytics and utility functions
│   └── seed_officers.sql       # Helper notes for officer password setup
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   ├── pages/user/
    │   ├── pages/vigilance/
    │   ├── pages/Home.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## Database Design

### Core Tables

1. **Users** – user account and profile data
2. **Emergency_Contacts** – user-linked emergency contacts (max 5 via procedure rule)
3. **Officers** – vigilance personnel and activation state
4. **SOS_Alerts** – raw emergency alert events + location
5. **Cases** – case entity mapped 1:1 to alert (`alert_id` unique)
6. **Assignments** – officer-to-case assignment history with active flag
7. **Case_Status_History** – immutable status transition log

### Stored Procedures

- `RegisterUser`
- `AddEmergencyContact`
- `CreateSOSAlert`
- `AssignOfficerToCase`
- `UpdateCaseStatus`
- `CloseCase`
- `RPT_AlertsPerDay`
- `RPT_CasesPerOfficer`
- `RPT_AvgResolutionTime`
- `RPT_StatusCount`

### Triggers

- `after_sos_insert` -> creates a case + initial history log
- `after_assignment_insert` -> updates case status to `Assigned`
- `after_case_status_update` -> logs status transition + closes alert on `Resolved`
- `after_case_closed` -> deactivates active assignments

### SQL Functions

- `GetTotalCasesByOfficer`
- `GetActiveCasesCount`
- `GetUserAlertCount`
- `GetAverageResponseTime`
- `GetCasesByStatus`

---

## Setup Guide

### Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+

### 1) Clone and Enter Project

```bash
git clone https://github.com/piyushahir05/Women-Emergency-Alert-Response-Management-System.git
cd Women-Emergency-Alert-Response-Management-System
```

### 2) Database Setup

Create and initialize the database by running SQL files in this order:

```sql
source database/schema.sql
source database/functions.sql
source database/triggers.sql
source database/procedures.sql
```

> `schema.sql` seeds default officers (without login password hash).

### 3) Backend Setup

```bash
cd backend
cp .env.example .env
npm install
```

Update `backend/.env` with your MySQL credentials and JWT secret.

### 4) Frontend Setup

```bash
cd ../frontend
npm install
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Example | Purpose |
|---|---|---|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | `your_password` | MySQL password |
| `DB_NAME` | `wearms_db` | Database name |
| `DB_PORT` | `3306` | Database port |
| `JWT_SECRET` | `change_me` | Token signing secret |
| `JWT_EXPIRES_IN` | `7d` | Token validity |
| `PORT` | `5000` | Backend server port |
| `NODE_ENV` | `development` | Runtime mode |

### Frontend (`frontend/.env` optional)

| Variable | Example | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | API base URL override |

---

## Running the Project

### Start Backend

```bash
cd backend
npm run dev
```

Backend runs at: `http://localhost:5000`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Production Build (Frontend)

```bash
cd frontend
npm run build
```

---

## API Reference

Base URL: `http://localhost:5000/api`

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | API health status |

### Auth Routes (`/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register user |
| POST | `/login` | User login |
| POST | `/vigilance/login` | Officer/Admin login |

### User Routes (`/user`) *(JWT required)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile` | Get user profile |
| PUT | `/updateProfile` | Update profile fields |
| GET | `/contacts` | List emergency contacts |
| POST | `/addContact` | Add emergency contact |
| DELETE | `/contacts/:contact_id` | Delete emergency contact |

### SOS Routes (`/sos`) *(JWT required)*

| Method | Endpoint | Description |
|---|---|---|
| POST | `/triggerSOS` | Trigger SOS alert |
| GET | `/caseStatus` | List user-linked cases |
| GET | `/caseStatus/:case_id/history` | Get case status timeline |
| GET | `/alertHistory` | List alert history |
| GET | `/dashboardStats` | User dashboard summary |

### Vigilance Routes (`/vigilance`) *(JWT + `officer/admin` role required)*

#### Case Operations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cases/new` | New cases queue |
| GET | `/cases/pending` | Active/pending cases |
| GET | `/cases/resolved` | Resolved cases |
| GET | `/cases/closed` | Closed cases |
| GET | `/cases/:id` | Detailed case view |
| POST | `/cases/:id/assign` | Assign officer |
| PUT | `/cases/:id/status` | Update case status |

#### Officer Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/officers` | Active officers |
| GET | `/officers/all` | All officers |
| GET | `/officers/:id/workload` | Officer workload stats |
| POST | `/officers` | Create new officer |
| PUT | `/officers/:id/toggle` | Toggle active/inactive |

#### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/summary` | Aggregate dashboard metrics |
| GET | `/reports/by-day` | Alerts trend by day |
| GET | `/reports/by-officer` | Cases per officer |
| GET | `/reports/status-count` | Case status distribution |

---

## Case Lifecycle

```text
SOS Triggered
   ↓
Case Auto-Created (New)
   ↓
Assigned
   ↓
In Progress
   ↓
Resolved
   ↓
Closed
```

Lifecycle behavior implemented through SQL procedures + triggers:
- status transitions are automatically logged in `Case_Status_History`;
- resolving a case closes the linked alert;
- closing a case deactivates active assignments.

---

## Validation and Build Status

Validation executed while updating documentation:

- ✅ `npm --prefix frontend run build` passes.
- ⚠️ `npm --prefix frontend run lint` currently reports pre-existing lint errors in source files unrelated to this README update.
- ℹ️ No backend test/lint scripts are currently defined in `backend/package.json`.

---

## Troubleshooting

### MySQL connection fails
- Verify `backend/.env` values for `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`.
- Ensure MySQL service is running and accessible.

### `401 Invalid or expired token`
- Re-login from frontend.
- Confirm `JWT_SECRET` is stable and not changed between token issue and verification.

### Officer login blocked
- Ensure the officer has a valid `password_hash` in `Officers` table.
- Ensure `is_active = TRUE` for that officer.

### Frontend cannot reach backend
- Confirm backend is running on `http://localhost:5000`.
- Verify frontend API base URL (`VITE_API_URL`).
- Ensure CORS origin includes frontend port (`5173` or `5174`).

---

## Future Improvements

- Add automated backend and frontend tests.
- Add API documentation with OpenAPI/Swagger.
- Add rate limiting and request auditing.
- Add geospatial nearest-officer assignment logic.
- Improve role hierarchy with dedicated admin flows.
- Add containerized deployment (Docker + Compose).

---

If you find this project useful, feel free to star the repository and contribute improvements.

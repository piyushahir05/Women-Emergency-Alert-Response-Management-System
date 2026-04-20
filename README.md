# WEARMS 🛡️
**Women Emergency Alert & Response Management System**

A full-stack DBMS mini-project — centralized SOS case tracking & emergency response management.

---

## Tech Stack
| Layer     | Technology |
|-----------|-----------|
| Frontend  | React + Vite |
| Backend   | Express.js + Node.js |
| Database  | MySQL 8+ |
| Auth      | JWT + bcrypt |

---

## Project Structure
```
wearms/
├── database/         # SQL files (run in order)
│   ├── schema.sql
│   ├── triggers.sql
│   ├── procedures.sql
│   └── functions.sql
├── backend/          # Express.js REST API
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── routes/
│   ├── app.js
│   └── server.js
└── frontend/         # React + Vite
    ├── src/
    │   ├── api/
    │   ├── context/
    │   ├── components/
    │   └── pages/
```

---

## Quick Start

### 1. Database Setup
Open MySQL Workbench or CLI and run:
```sql
source database/schema.sql
source database/triggers.sql
source database/procedures.sql
source database/functions.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # edit with your MySQL credentials
npm install
npm run dev                  # runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                  # runs on http://localhost:5173
```

---

## Environment Variables (`backend/.env`)
| Variable       | Default  | Description |
|----------------|----------|-------------|
| DB_HOST        | localhost | MySQL host |
| DB_USER        | root     | MySQL user |
| DB_PASSWORD    |          | MySQL password |
| DB_NAME        | wearms_db| Database name |
| JWT_SECRET     | —        | JWT signing secret |
| PORT           | 5000     | API port |

---

## First Officer Setup
After running `schema.sql`, seed officer passwords by hitting the backend API:
```bash
curl -X POST http://localhost:5000/api/vigilance/officers \
  -H "Authorization: Bearer <officer_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Inspector Priya","badge_no":"OFF-001","department":"Women Safety","password":"Vigilance@123"}'
```

Or update directly in MySQL (use bcrypt hash):
```sql
UPDATE Officers SET password_hash = '$2b$10$...' WHERE badge_no = 'OFF-001';
```

---

## Core DB Features
| Feature | Details |
|---------|---------|
| Stored Procedures | RegisterUser, AddEmergencyContact, CreateSOSAlert, AssignOfficerToCase, UpdateCaseStatus, CloseCase + 4 RPT_ procedures |
| Triggers | after_sos_insert, after_assignment_insert, after_case_status_update, after_case_closed |
| Analytics Functions | GetTotalCasesByOfficer, GetActiveCasesCount, GetUserAlertCount, GetAverageResponseTime, GetCasesByStatus |
| Schema | 7 tables in 3NF with FK constraints and indexes |

---

## Case Lifecycle
```
SOS Triggered → [New] → [Assigned] → [In Progress] → [Resolved] → [Closed]
```
Every status transition is automatically logged to `Case_Status_History`.

---

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | User registration |
| POST | /api/auth/login | User login |
| POST | /api/auth/vigilance/login | Officer login |
| POST | /api/sos/triggerSOS | Trigger SOS |
| GET  | /api/sos/caseStatus | User's cases |
| GET  | /api/vigilance/cases/new | New cases |
| POST | /api/vigilance/cases/:id/assign | Assign officer |
| PUT  | /api/vigilance/cases/:id/status | Update status |
| GET  | /api/vigilance/reports/summary | Reports |

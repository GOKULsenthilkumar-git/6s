# 6s — Application Tracking System (ATS)

This repository contains a simple Application Tracking System with a backend (Express + MongoDB) and a frontend (React + Vite + Tailwind). The backend includes an automated processor service that can review applications, schedule interviews, and make offer/reject decisions based on configurable probabilities.

---

## Table of contents

- Project overview
- Prerequisites
- Backend
  - Setup
  - Environment variables
  - Run
  - Auto-processor behavior and config
  - Troubleshooting
- Frontend
  - Setup
  - Run
- Development notes
- Files of interest
- Contributing

---

## Project overview

- Backend: Express.js, Mongoose (MongoDB), basic JWT auth, routes for applications, jobs, bot actions, and an automatic processor service (`backend/services/autoProcessorService.js`) that periodically processes applications.
- Frontend: React (Vite) with Tailwind CSS. Pages for admin, applicants, and bot/dashboard views.

The auto-processor was implemented to use probabilistic decision-making (configurable via environment variables) and now persists scheduled interview details on the `Application` document.

---

## Prerequisites

- Node.js (recommend v16+ or the version used in the project)
- npm (or yarn/pnpm)
- MongoDB instance — either a local `mongod` or a MongoDB Atlas cluster

If using MongoDB Atlas, ensure your current IP address is allowed in the cluster's Network Access (IP whitelist). See Troubleshooting below.

---

## Backend

Location: `backend/`

### Setup

1. Install dependencies (PowerShell):

```powershell
Set-Location 'E:\6s final\6s\backend'
npm install
```

2. Create or update `backend/.env` with required values (an example is included in the repo):

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.abcde.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
NODE_ENV=development
```

If you prefer local MongoDB, use:

```
MONGODB_URI=mongodb://localhost:27017/6s_db
```

### Environment variables (not exhaustive)

- `MONGODB_URI` — MongoDB connection string (required)
- `PORT` — port for the backend (default: 5000)
- `JWT_SECRET` — secret used to sign JWT tokens
- `JWT_EXPIRE` — token lifetime (e.g. `30d`)
- `NODE_ENV` — `development` or `production`

Auto-processor tuning variables (optional):

- `AUTO_INTERVIEW_PROB` — float 0..1 (default `0.7`) — probability to schedule an interview for reviewed technical applications
- `AUTO_OFFER_PROB` — float 0..1 (default `0.6`) — probability to extend an offer after an interview
- `AUTO_INTERVIEW_OFFSET_MS` — integer milliseconds (default `120000`) — how far in the future the interview is scheduled (use larger values for real workflows)

### Run (PowerShell)

```powershell
# from backend folder
node server.js
```

Server startup notes:

- The server now loads `backend/.env` explicitly, and only starts the Express server and the auto-processor after a successful DB connection.
- If the DB connection fails, the server will exit with an explanatory message.

### Auto-processor behavior

The auto-processor service (`backend/services/autoProcessorService.js`) periodically does the following (timings in the dev code are short for testing):

- `Applied` → `Reviewed` (auto-review for technical roles after a short delay)
- `Reviewed` → `Interview` (schedules an interview with probability `AUTO_INTERVIEW_PROB`) or `Rejected`
  - When scheduling an interview, the service now writes an `interview` subdocument to the `Application` model containing `scheduledAt`, `location`, `createdAt`, `createdBy`, and `notes`.
- `Interview` → `Offer` (with probability `AUTO_OFFER_PROB`) or `Rejected`
- `Applied`/`Reviewed` → `Rejected` if stale after a configurable timeout in the code (dev default is small for testing)

To observe many interviews during testing, set `AUTO_INTERVIEW_PROB=0.9`. To reduce rejections, increase that probability or increase stale timeouts.

### Troubleshooting

Common issues and fixes:

- "Could not connect to any servers in your MongoDB Atlas cluster" — likely your IP is not whitelisted in Atlas. Fix by:

  - Log into MongoDB Atlas → Network Access → Add IP Address → add your current public IP (or a temporary `0.0.0.0/0` for testing only).

- `MONGODB_URI` is undefined — ensure `backend/.env` exists and contains `MONGODB_URI`, or export the variable in your environment before starting the server.

- Deprecated mongoose driver warnings (older code): these were removed from the repo — you should not see `useNewUrlParser`/`useUnifiedTopology` warnings anymore. If you do, ensure `backend/config/db.js` does not pass those options to `mongoose.connect()`.

---

## Frontend

Location: `frontend/`

### Setup

```powershell
Set-Location 'E:\6s final\6s\frontend'
npm install
```

### Run (PowerShell)

```powershell
Set-Location 'E:\6s final\6s\frontend'
npm run dev
```

Open the dev server URL reported by Vite (usually `http://localhost:5173`). The frontend uses `src/api/axiosClient.js` to connect to the backend — ensure the backend is running and the client base URL is correct.

### Note on frontend and interviews

The backend now adds an `interview` object to applications when an interview is scheduled. If you want the frontend to display scheduled interviews, add rendering for `application.interview.scheduledAt` and the related fields in the relevant components/pages (e.g., `AdminApplications.jsx`, `ApplicantDashboard.jsx`). I can add those UI changes if you want.

---

## Development notes

- `backend/models/Application.js` includes an optional `interview` subdocument. Existing data is compatible because this field is optional.
- The auto-processor runs periodically and will attempt to query the `applications` collection — ensure the database is reachable before the processor starts (the server now ensures this ordering).
- A `backend/.gitignore` file exists to avoid committing `node_modules` and `.env` files.

---

## Files of interest

- Backend

  - `backend/server.js` — app entry; starts server after DB connect
  - `backend/config/db.js` — mongoose connection helper
  - `backend/services/autoProcessorService.js` — automated processing logic (probabilistic decisions and interview scheduling)
  - `backend/models/Application.js` — application schema (includes `interview` subdocument)

- Frontend
  - `frontend/src/pages/AdminApplications.jsx` — admin view for applications
  - `frontend/src/api/axiosClient.js` — axios instance and base URL

---

## Contributing

- Keep secrets out of the repository: use `backend/.env` locally and add it to `.gitignore` (already present).
- If you change environment variables or add new ones, document them in this README.

---

If you'd like, I can:

- Add UI rendering for scheduled interviews in `AdminApplications.jsx` and applicant pages.
- Add a small script to seed test data so you can watch the auto-processor behavior quickly.
- Add a lightweight `backend/README.md` with specific developer commands.

Tell me which of the above you'd like me to do next.

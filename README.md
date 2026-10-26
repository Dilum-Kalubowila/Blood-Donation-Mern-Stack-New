# LifeFlow — Blood Donation & Matching Platform (MERN)

A full-stack MERN starter for blood donation with animated UI, donor/receiver registration, FIFO receiver matching, JWT authentication, and admin management.

## Requirements
- Node.js 20+ and npm
- MongoDB running locally or a MongoDB Atlas URI

## 1. Setup backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Edit `backend/.env` and set `MONGO_URI`, `JWT_SECRET`, and optionally `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
The server creates the configured admin account on startup if it does not already exist.

## 2. Setup frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally http://localhost:5173).

## Default admin
Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before the first backend start. Do not use the example credentials in production.

## Main features
- Register/login with JWT; user roles: `admin` and `user`
- A user can add donor and receiver records
- Receiver queue is processed oldest-first; for each receiver, donors are checked for compatible blood types
- When a match is found, both records are marked matched/removed from active lists and a match event is stored and displayed
- New donor/receiver data triggers matching again from the beginning
- Admin dashboard can view and manage users, donor records, receiver records, and match history
- Animated gradient / floating blood-cell background

## Blood compatibility
For red-cell donation, the backend supports ABO and Rh compatibility:
- O− can donate to all blood groups
- O+ to O+, A+, B+, AB+
- A− to A−, A+, AB−, AB+
- A+ to A+, AB+
- B− to B−, B+, AB−, AB+
- B+ to B+, AB+
- AB− to AB−, AB+
- AB+ to AB+

This is an educational project, not a clinical allocation system. Real transfusions require blood typing, antibody screening, crossmatching, and decisions by qualified medical staff. The software must not be used to make real clinical decisions.

## API overview
- `POST /api/auth/register` — create normal user
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/records/donors`
- `POST /api/records/receivers`
- `GET /api/records/summary`
- `GET /api/records/matches`
- Admin: `GET /api/admin/users`, `GET /api/admin/records`, `DELETE /api/admin/records/:type/:id`, `DELETE /api/admin/users/:id`

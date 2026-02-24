# Beauty Parlor App
## By Francis Njoroge and Beverly Ndukwe

A full-stack web application for managing beauty parlor services, stylists, and customer appointments. The frontend is built with React (Vite) and the backend is built with Flask, featuring JWT authentication, role-based access, and M-Pesa payment initiation for bookings.

## Live Demo
- Frontend: https://beauty-parlor-app-ztgj.vercel.app
- Backend: https://beauty-parlor-app-5.onrender.com

## Features
- Customer registration and login with JWT authentication
- Browse services and view stylist offerings
- Book appointments with stylists
- Role-based access (customer vs admin)
- Admin analytics for bookings, revenue, and usage
- M-Pesa payment initiation (sandbox)
- Reviews for stylists

## Tech Stack
- Frontend: React (Vite), React Router, Chart.js, Formik, Yup
- Backend: Flask, Flask-RESTful, SQLAlchemy, Flask-Migrate, JWT
- Database: SQLite (local dev)
- Deployment: Vercel (frontend), Render (backend)

## Project Structure
- `client/` React app (Vite)
- `server/` Flask API, database models, and migrations

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ and pip

### Backend Setup
```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask db upgrade
python seed.py
flask run
```

Notes:
- `python seed.py` drops and recreates the database. Use only in development.
- The API runs on `http://127.0.0.1:5000` by default.

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Environment Variables
Create a `.env` file in `server/` for M-Pesa integration:
```bash
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
BASE_URL=http://127.0.0.1:5000
```

## API Overview
Authentication:
- `POST /register`
- `POST /login`
- `GET /me`

Core resources:
- `GET /services`
- `POST /services` (auth)
- `GET /stylists`
- `POST /stylists` (admin)
- `GET /bookings` (auth)
- `POST /bookings` (auth)

Admin:
- `GET /admin/analytics/summary`
- `GET /admin/users`
- `GET /admin/bookings`

Payments and reviews:
- `POST /initiate-mpesa-payment` (auth)
- `POST /reviews` (auth)
- `GET /stylists/:id/reviews`

## Default Admin (Seed Data)
When seeded, a default admin is created for local testing:
- Name: `admin`
- Phone: `0700123456`
- Password: `admin123`

## Deployment
- Frontend: Vercel
- Backend: Render

## Repository
https://github.com/Ka-few/Beauty-parlor-app

## License
MIT License. See `LICENSE`.

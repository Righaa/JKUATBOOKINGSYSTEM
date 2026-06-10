# JKUAT Hospital Booking System

A full-stack hospital appointment booking system for Jomo Kenyatta University of Agriculture and Technology (JKUAT), with separate portals for **Admin**, **Doctor**, and **Patient** users.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, SignalR, Axios
- **Backend:** ASP.NET Core Web API, Entity Framework Core, SQL Server
- **Auth:** JWT (role-based: Admin, Doctor, Patient)

## Prerequisites

- Node.js 18+
- .NET SDK 10+
- SQL Server (Express or full)

## Setup

### 1. Database

```powershell
cd backend/JkuatHospitalApi
dotnet ef database update
```

### 2. Backend configuration

Copy the example development settings and adjust for your machine:

```powershell
copy appsettings.Development.json.example appsettings.Development.json
```

Edit `appsettings.Development.json` with your JWT secret and optional Twilio SMS credentials.

The committed `appsettings.json` uses safe placeholders only — **do not commit real API keys**.

### 3. Run backend

```powershell
cd backend/JkuatHospitalApi
dotnet run
```

API runs at **http://localhost:5165**

### 4. Run frontend

```powershell
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

Optional: set `VITE_API_URL` in `frontend/.env` if the API is not on port 5165.

## Default accounts

| Role    | Login |
|---------|-------|
| Admin   | `admin@jkuat.ac.ke` / `Admin@123` |
| Doctor  | Doctor ID (shown when admin creates a doctor) / initial password set by admin |
| Patient | Register at `/register`, then log in at `/login` |

Change default passwords after first login (Admin and Doctor have **Change Password** in the sidebar).

## Features

- Patient registration, profile, and appointment booking
- Admin doctor management and appointment approvals
- Doctor appointments, patient records, medical notes, calendar
- Approve / reject (with reason) / cancel / complete appointments
- Real-time in-app notifications (SignalR)
- Optional SMS reminders via Twilio (disabled by default)

## Project structure

```
frontend/          React UI
backend/JkuatHospitalApi/   .NET API, EF migrations, SignalR hub
```

## Notes before deployment

- Rotate JWT secret and default seeded passwords
- Set `Cors:AllowedOrigins` in `appsettings.json` for your production domain
- Enable SMS only with valid Twilio credentials and `FromNumber`
- Stop any running API process before `dotnet build` (avoids file lock errors)

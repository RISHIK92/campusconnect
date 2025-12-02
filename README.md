# CampusConnect – College Event Registration System

## 1. Problem Statement

Managing college event registrations manually is inefficient and error-prone. Students often struggle to stay updated about upcoming events, and organizers face difficulties in maintaining attendance and verifying participants.

**CampusConnect** aims to digitize this process — enabling students to register online, view events easily, and receive digital QR passes for smooth entry verification. Admins can efficiently manage event data and scan QR codes to track attendance.

## 2. System Architecture

### Overview

`Frontend (React + Tailwind)` → `Backend API (Node.js + Express)` → `Database (PostgreSQL + Prisma)`

### Flow

1.  **Authentication**: Students sign up and log in using JWT authentication.
2.  **Data Serving**: Backend serves event data from the database to the frontend.
3.  **Registration**: On registration, the backend generates a unique QR code for each user-event combination.
4.  **Verification**: Admins can scan QR codes to verify entries and mark attendance.

### Hosting Plan

| Layer        | Service                 |
| :----------- | :---------------------- |
| **Frontend** | Vercel / Netlify        |
| **Backend**  | Render / Railway        |
| **Database** | PostgreSQL (Prisma ORM) |

## 3. System Modules

| Module                 | Description                                                                       |
| :--------------------- | :-------------------------------------------------------------------------------- |
| **Authentication**     | User (student) registration, login, and role-based admin access.                  |
| **Event Management**   | Admin can create, edit, and delete events.                                        |
| **Event Listing**      | All users can view upcoming and past events.                                      |
| **Event Registration** | Students can register; system generates unique QR codes.                          |
| **QR Verification**    | Admin can scan QR codes using any QR scanner or web camera for validation.        |
| **Dashboard**          | Admin dashboard for analytics — total events, registered users, attendance stats. |

## 4. Key Features

| Category                           | Features                                                           |
| :--------------------------------- | :----------------------------------------------------------------- |
| **Authentication & Authorization** | JWT-based login/signup, role-based access (user/admin).            |
| **Event Operations (CRUD)**        | Admin can create, read, update, and delete events.                 |
| **Registration System**            | Students can register once per event, and receive a QR pass.       |
| **QR Code Generation**             | Unique QR generated per registration; used for entry verification. |
| **Frontend Routing**               | Pages: Home, Events, Event Details, Login, Register, Dashboard.    |
| **QR Scan Feature (Optional)**     | Admin can mark attendance by scanning QR code via webcam.          |
| **Hosting**                        | Frontend and backend deployed on cloud (Vercel + Render).          |

## 5. Tech Stack

| Layer                  | Technologies                                             |
| :--------------------- | :------------------------------------------------------- |
| **Frontend**           | React.js, React Router, Axios, TailwindCSS               |
| **Backend**            | Node.js, Express.js                                      |
| **Database**           | PostgreSQL (Prisma ORM)                                  |
| **Authentication**     | JWT (JSON Web Token)                                     |
| **QR Code Generation** | `qrcode` npm package                                     |
| **Hosting**            | Vercel (frontend), Render/Railway (backend), NeonDB (DB) |

## 6. API Overview

| Endpoint                   | Method | Description                                   | Access        |
| :------------------------- | :----- | :-------------------------------------------- | :------------ |
| `/api/auth/signup`         | POST   | Register a new student                        | Public        |
| `/api/auth/login`          | POST   | Login and receive token                       | Public        |
| `/api/events`              | GET    | Fetch all available events                    | Authenticated |
| `/api/events/:id/register` | POST   | Register user for specific event, generate QR | Authenticated |
| `/api/events`              | POST   | Add new event                                 | Admin         |
| `/api/events/:id`          | PUT    | Update event details                          | Admin         |
| `/api/events/:id`          | DELETE | Delete event                                  | Admin         |
| `/api/verify/:qrId`        | GET    | Verify QR and mark attendance                 | Admin         |

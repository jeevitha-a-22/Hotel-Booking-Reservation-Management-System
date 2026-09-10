# Hotel Booking & Reservation Management System

## Project Title & Team Details

**Project:** Hotel Booking & Reservation Management System  
**Course:** Advanced JavaScript Backend Frameworks – CIA-3  
**Technologies:** Node.js, Express.js, MongoDB Atlas, Mongoose

| S.No | Name | Register No. | Department | Section |
|---:|---|---:|---|:---:|
| 1 | Jeevitha A | 2462079 | ADSE | 5BTCSAIML B |
| 2 | Gopireddy Rethvik Reddy | 2462076 | ADSE | 5BTCSAIML B |
| 3 | Florentina Francis | 2462070 | ADSE | 5BTCSAIML B |
| 4 | Girikshith | 2462073 | ADSE | 5BTCSAIML B |

---

## Team Member Contributions

| Team Member | Register No. | Contribution |
|---|---:|---|
| **Jeevitha A** | 2462079 | Authentication, User Management and Role-Based Access Control |
| **Gopireddy Rethvik Reddy** | 2462076 | Hotel Management, Room Type Management and Room Inventory |
| **Florentina Francis** | 2562070 | Booking Workflow, Availability Search, Check-In and Check-Out |
| **Girikshith** | 2462073 | Dynamic Pricing, Housekeeping, Guest History, Invoice, Admin Reports, Postman Testing and Documentation |

---

## Problem Statement

Managing hotel reservations manually can lead to booking conflicts, inaccurate room availability, inefficient guest management and difficulties in tracking hotel operations. Hotels require a centralized system to manage hotels, room types, room inventory, guest bookings, availability, pricing, check-in, check-out, housekeeping and reporting.

The Hotel Booking & Reservation Management System addresses these requirements by providing a RESTful backend API for managing hotel operations. The system includes secure authentication, role-based authorization, hotel and room management, availability checking, booking workflows, dynamic pricing, housekeeping management, cancellation handling, invoice generation, guest booking history and administrative reports using MongoDB-based data storage.

---

## Tech Stack Used

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcrypt
- express-validator
- dotenv
- CORS
- Postman
- GitHub

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd project-root

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

Use `.env.example` as a reference and configure the required environment variables.

Example:

```env
PORT=5050
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

Do not commit the `.env` file to GitHub.

### 4. Start the Server

For normal execution:

```bash
npm start
```

For development:

```bash
npm run dev
```

The server runs locally on:

```text
http://localhost:5050
```

API base URL:

```text
http://localhost:5050/api
```

Health Check:

```text
GET /api/health
```

---
## List of Implemented Modules

The project implements the following functional modules:

1. **Authentication & User Management** – Allows users to register, log in and access protected resources using JWT authentication.
2. **Role-Based Access Control (RBAC)** – Restricts guest, staff and admin operations according to their assigned roles.
3. **Hotel Management** – Allows authorized users to create, view, update and manage hotel information.
4. **Room Type & Inventory Management** – Manages room types, room capacity, pricing and physical room inventory.
5. **Availability Search** – Allows users to search for available rooms based on check-in and check-out dates.
6. **Booking & Reservation Management** – Allows guests and administrators to create and manage hotel bookings.
7. **Booking Status Management** – Allows authorized staff and administrators to update booking status.
8. **Check-In & Check-Out Management** – Manages guest arrival and departure operations.
9. **Housekeeping Management** – Allows room housekeeping status to be updated and monitored.
10. **Booking Cancellation** – Allows eligible bookings to be cancelled with status validation.
11. **Guest Booking History** – Allows guests to view their booking history and reservation details.
12. **Invoice Generation** – Generates invoice information for individual bookings.
13. **Admin Reports & Monitoring** – Provides administrative information related to bookings, rooms and hotel operations.

---

## API Endpoint Reference

### Authentication

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/me` | Get authenticated user details |

### Hotel Management

| Method | Path | Description |
|---|---|---|
| POST | `/api/hotels` | Create a hotel |
| GET | `/api/hotels` | Get all hotels |
| GET | `/api/hotels/:id` | Get hotel by ID |
| PUT | `/api/hotels/:id` | Update hotel |
| DELETE | `/api/hotels/:id` | Delete hotel |

### Room Type Management

| Method | Path | Description |
|---|---|---|
| POST | `/api/room-types` | Create room type |
| GET | `/api/room-types` | Get room types |
| GET | `/api/room-types/:id` | Get room type by ID |
| PUT | `/api/room-types/:id` | Update room type |
| DELETE | `/api/room-types/:id` | Delete room type |

### Room Inventory Management

| Method | Path | Description |
|---|---|---|
| POST | `/api/rooms` | Create room |
| GET | `/api/rooms` | Get all rooms |
| GET | `/api/rooms/:id` | Get room by ID |
| PUT | `/api/rooms/:id` | Update room |
| DELETE | `/api/rooms/:id` | Delete room |

### Availability Search

| Method | Path | Description |
|---|---|---|
| GET | `/api/availability` | Search available rooms |

### Booking Management

| Method | Path | Description |
|---|---|---|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings/:id` | Get booking by ID |
| PUT | `/api/bookings/:id/status` | Update booking status |
| PUT | `/api/bookings/:id/checkin` | Check in a booking |
| PUT | `/api/bookings/:id/checkout` | Check out a booking |
| PUT | `/api/bookings/:id/cancel` | Cancel a booking |
| GET | `/api/bookings/:id/invoice` | Get booking invoice |

### Housekeeping Management

| Method | Path | Description |
|---|---|---|
| PUT | `/api/rooms/:roomId/housekeeping` | Update room housekeeping status |

### Guest Booking History

| Method | Path | Description |
|---|---|---|
| GET | `/api/guests/:id/bookings` | Get guest booking history |

### Admin Reports

| Method | Path | Description |
|---|---|---|
| GET | `/api/reports` | Get administrative reports |

---

## Postman Collection

The Postman collection containing the API requests and testing scenarios is available in:

`postman/`

The collection demonstrates successful API requests along with validation failures, unauthorized access and role-based authorization scenarios.

---

## Database Schema Summary

The application uses MongoDB Atlas with Mongoose.

### User Collection

Stores guest, staff and administrator information.

Main fields include:

- `name`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

Supported roles:

- `guest`
- `staff`
- `admin`

### Hotel Collection

Stores hotel information.

Main fields include:

- Hotel name
- Address
- Location
- Contact information

### Room Type Collection

Stores room category information.

Main fields include:

- `hotelId`
- Room type name
- Capacity
- Price
- Description

### Room Collection

Stores individual physical room information.

Main fields include:

- `roomTypeId`
- `roomNumber`
- `housekeepingStatus`

Housekeeping statuses include:

- `Clean`
- `Dirty`
- `Inspected`
- `OutOfService`

### Booking Collection

Stores hotel reservation information.

Main fields include:

- `guestId`
- `hotelId`
- `roomTypeId`
- `checkIn`
- `checkOut`
- `occupancy`
- `status`
- `totalAmount`
- `addOns`

Booking statuses include:

- `Reserved`
- `Confirmed`
- `CheckedIn`
- `CheckedOut`
- `Cancelled`

### Relationships

User
  |
  └── Booking
        |
        ├── Hotel
        |
        └── Room Type
              |
              └── Room

### Known Limitations

- The project is primarily a backend REST API and does not include a complete production frontend.
- Payment gateway integration is not included.
- Email and SMS notifications are not implemented.
- Real-time room synchronization is outside the current project scope.
- The application is intended for academic demonstration and testing.
- The system is not intended to be a production-ready hotel reservation platform without additional security and scalability improvements.
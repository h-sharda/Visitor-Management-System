# Vehicle Management System

## Overview

The Vehicle Management System is a full-stack application that lets authenticated users manage vehicle entries, including image uploads, license plate extraction, and role-based operations.

## Features

- **OTP-based Authentication:** Users log in securely by verifying a one-time password received via email.
- **Vehicle Entry Management:** Upload vehicle images to AWS S3, extract license plates, and update or delete entries as needed.
- **Role-Based Access Control:** Supports multiple user roles (GUEST, VIEWER, OPERATOR, ADMIN) to restrict functionality appropriately.
- **API Integration:** Uses an external API for license plate extraction.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose.
- **Frontend:** HTML, CSS (Tailwind CSS, Bootstrap), and JavaScript.
- **Authentication:** OTP verification with JWT.
- **Storage:** AWS S3 for image uploads.
- **Email Service:** Nodemailer for OTP emails.
- **External Service:** License plate extraction API. [1]

## Project Structure

```md []
project-root/
├── server.js                        # Main server entry point
├── config/
│   ├── aws.js                       # AWS S3 configuration
│   └── mongodb.js                   # MongoDB connection setup
├── controllers/
│   ├── authController.js            # Authentication controller
│   └── entryController.js           # Vehicle entry controller
├── middlewares/
│   ├── authMiddleware.js            # Authentication middleware
│   └── uploadMiddleware.js          # File upload middleware
├── models/
│   ├── Entry.js                     # Vehicle entry model
│   ├── OTP.js                       # OTP model
│   └── User.js                      # User model
├── routes/
│   ├── entryRoutes.js               # Vehicle entry routes
│   └── userRoutes.js                # User authentication routes
├── services/
│   ├── authService.js               # JWT authentication service
│   ├── emailService.js              # Email service for OTP
│   ├── numberExtractionService.js   # License plate extraction service
│   └── otpService.js                # OTP generation and verification
└── public/
    ├── index.html                   # Main application page
    ├── signin.html                  # Sign-in page
    └── script.js                    # Frontend JavaScript
```

## Installation

1. **Clone the repository:**  
   `git clone`

2. **Install dependencies:**  
   `npm install`

3. **Configure Environment Variables:**  
   Create a `.env` file in the project root with the following keys:
   - `PORT`
   - `MONGO_URI`
   - `JWT_SECRET_KEY`
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_BUCKET_NAME`
   - `GMAIL`
   - `GMAIL_APP_PASSWORD`
   - `NUMBER_EXTRACTION_API`

4. **Start the server:**  
   Run `node server.js` or use `npm start`.

## API Endpoints

### User Routes

- **POST /user/request-otp:** Request a one-time password.
- **POST /user/verify-otp:** Verify the OTP and sign in (JWT token issued).
- **GET /user/logout:** Log out and clear the authentication cookie.
- **GET /user/check-auth:** Check the current authentication status.

### Vehicle Entry Routes

- **GET /entries:** Retrieve all vehicle entries
- **POST /upload:** Upload a new vehicle image.
- **PUT /entries/:id:** Update a vehicle entry’s number
- **DELETE /entries/:id:** Delete a vehicle entry

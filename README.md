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
- **Frontend:** React (Vite), CSS (Tailwind CSS).
- **Authentication:** OTP verification with JWT.
- **Storage:** AWS S3 for image uploads.
- **Email Service:** Nodemailer for OTP emails.
- **External Service:** License plate extraction API.

## Installation

1. **Clone the repository:**  
   `git clone`

2. **Install dependencies:**  
   `npm install`

3. **Build Frontend:**  
   `npm run build`

4. **Configure Environment Variables:**  
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

5. **Start the server:**  
   Run `node server.js` or use `npm run start`.

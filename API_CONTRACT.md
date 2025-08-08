# API Contract - Village Pulse

This document defines the API contract between the frontend and backend for the Village Pulse application. It outlines all endpoints, request formats, and responses to ensure smooth integration and collaboration.

---

## 🔐 Authentication & User Management

### 1. Send OTP

- **Feature:** Request OTP for phone verification  
- **HTTP Method:** POST  
- **Endpoint Path:** `/api/auth/send-otp`  
- **Description:** Sends a one-time password (OTP) to the user's phone number for verification.  

**Request Body:**
```json
{
  "phone": "+91XXXXXXXXXX"
}
```
**Success Response (200 OK):**
```json
{
  "message": "OTP sent successfully"
}
```
**Error Responses:**
```json
{
  "error": "Invalid phone number"
}

{
  "error": "Too many attempts. Try again later."
}
```
### 2. Verify OTP & Register User

- **Feature:** Register a new user after OTP is verified
- **HTTP Method:** POST
- **Endpoint Path:** /api/auth/register
- **Description:** Creates a new user account after verifying the OTP.

**Request Body:**
```json
{
  "name": "Saisha Gaude",
  "email": "saisha@example.com",
  "password": "yourPassword123",
  "phone": "+91XXXXXXXXXX",
  "otp": "123456",
  "location": {
    "latitude": 15.2993,
    "longitude": 74.1240
  }
}
```
**Success Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "userId": "abc123"
}
```
**Error Responses:**
```json
{
  "error": "Invalid OTP or expired"
}

{
  "error": "Email or phone already registered"
}
```

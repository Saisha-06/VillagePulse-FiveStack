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
- **Description:** Creates a new user account after verifying the OTP and stores the user data in the database.

**Request Body:**
```json
{
  "name": "firstname lastname",
  "email": "user@example.com",
  "password": "userPassword123",
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
### 3. User Login

- **Feature:** User Login
- **HTTP Method:** POST
- **Endpoint Path:** /api/auth/login
- **Description:** Authenticates a user by verifying email and password. Returns an access token upon successful login.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userPassword123"
}
```
**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "abc123",
    "name": "firstname lastname",
    "email": "user@example.com",
    "phone": "+91XXXXXXXXXX"
  }
}
```
#### Error Responses:
**401 Unauthorized:**
```json
{
  "error": "Invalid email or password"
}
```
**500 Internal Server Error:**
```json
{
  "error": "Server error, please try again later"
}
```

## 🔐 Department Authentication & Management

Since departments are predefined by the admin (team), there's no public registration route for them. Only a login endpoint is needed.

### 4.Department Login:

- **Feature:** Department Login
- **HTTP Method:** POST
- **Endpoint Path:** /api/departments/login
- **Description:** Authenticates a department user via email and password. Returns a token upon successful login.

**Request Body:**
```json
{
  "email": "dept.fire@goa.gov.in",
  "password": "securePass123"
}
```
**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "department": {
    "id": "d001",
    "name": "Fire Department",
    "email": "dept.fire@goa.gov.in",
    "phone": "+91112233445"
  }
}
```
#### Error Responses:
**401 Unauthorized:**
```json
{
  "error": "Invalid email or password"
}
```
**500 Internal Server Error:**
```json
{
  "error": "Server error. Please try again later."
}
```
## 📣 Report Management

### 5. Report an Issue

- **Feature:** Report a utility issue
- **HTTP Method:** POST
- **Endpoint Path:** /api/reports
- **Description:** Allows a logged-in user to report an issue with optional image and precise location. Phone number (already saved in profile) is internally attached to the report for the department.

**Request Body:**
```json
{
  "category": "Fire",
  "description": "Fire spotted near the main road.",
  "location": {
    "latitude": 15.2993,
    "longitude": 74.1240
  },
  "imageUrl": "https://example.com/photo.jpg"  // optional
}
```
> 🔒 This requires user authentication. The backend should fetch the user ID & phone from token.

**Success Response (201 Created):**
```json
{
  "message": "Report submitted successfully",
  "reportId": "r12345"
}
```
#### Error Responses: 
**400 Bad Request:**
```json
{
  "error": "Missing required fields"
}
```
**500 Internal Server Error:**
```json
{
  "error": "Could not save report"
}
```

## 📍 6. View Nearby Reports

- **Feature:** Get reports around user's current location
- **HTTP Method:** GET
- **Endpoint Path:** /api/reports/nearby
- **Description:** Retrieves a list of recent public reports within a certain radius (e.g., 3 km) of the user’s current location. Helps users stay aware of local issues.

> ✅ Requires user authentication. Backend will use the user’s location from their profile (or client-sent location, if permitted).

**Request Parameters (Query):**

/api/reports/nearby?latitude=15.2993&longitude=74.1240&radius=3

| Parameter | Type   | Required | Description                            |
|-----------|--------|----------|----------------------------------------|
| latitude  | float  | Yes      | User's current latitude                |
| longitude | float  | Yes      | User's current longitude               |
| radius    | number | No       | Search radius in kilometers (default: 3) |

**Success Response (200 OK):**
```json
{
  "message": "Nearby reports fetched successfully",
  "reports": [
    {
      "id": "r12345",
      "category": "Power Outage",
      "description": "No power since morning",
      "location": {
        "latitude": 15.3001,
        "longitude": 74.1239
      },
      "timestamp": "2025-08-08T10:30:00Z",
      "reporter": {
        "name": "John Fernandes"
      },
      "status": "Pending",
      "imageUrl": "https://example.com/power_issue.jpg"
    },
    ...
  ]
}
```
#### Error Responses:
**400 Bad Request:**
```json
{
  "error": "Missing or invalid location parameters"
}
```
**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch nearby reports"
}
```
## 7. Get My Reports

- **Feature:** Fetch all reports submitted by the currently logged-in user  
- **HTTP Method:** GET  
- **Endpoint Path:** `/api/reports/my`  
- **Description:** Returns a list of reports submitted by the authenticated user. Useful for showing their reporting history on the user dashboard or app.

🔐 **Requires user authentication**  
The backend should fetch user ID from the token (JWT) passed in the request headers.

**Success Response (200 OK):**
```json
{
  "message": "Your reports fetched successfully",
  "reports": [
    {
      "id": "r456",
      "category": "Road Block",
      "description": "Tree fallen across the road",
      "location": {
        "latitude": 15.3001,
        "longitude": 74.1250
      },
      "photoUrl": "https://example.com/tree.jpg",
      "status": "Resolved",
      "createdAt": "2025-08-07T15:10:00Z"
    }
  ]
}
```
#### Error Responses:
**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```
**500 Internal Server Error:**
```json
{
  "error": "Unable to fetch your reports at the moment"
}
```
##  Upvote / Support an Existing Report

(Useful when multiple users report or support the same issue)

### 8. Support a Report

- **Feature:** Upvote / support an already submitted report  
- **HTTP Method:** POST  
- **Endpoint Path:** `/api/reports/:id/support`  
- **Description:** Allows a logged-in user to support (or agree with) a reported issue. Helps departments prioritize based on number of affected users.

🔐 **Requires user authentication**

**Request Parameters (Path):**
- `id` (string): Report ID to support

**Success Response (200 OK):**
```json
{
  "message": "You supported this report successfully",
  "reportId": "r789",
  "supportCount": 3
}
```
#### Error Responses:
**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```
**404 Not Found:**
```json
{
  "error": "Report not found"
}
```
**409 Conflict:**
```json
{
  "error": "You have already supported this report"
}
```

### 9. Department Login

- **Feature:** Login for predefined department officials  
- **HTTP Method:** POST  
- **Endpoint Path:** `/api/departments/login`  
- **Description:** Authenticates a department user and returns a token for accessing protected endpoints.

**Request Body:**
```json
{
  "email": "dept-pwd@example.com",
  "password": "securePassword123"
}
```
**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "department": {
    "id": "d001",
    "name": "Public Works Department",
    "email": "pwd@example.com",
    "phone": "+911234567890"
  }
}
```
#### Error Responses:
**401 Unauthorized:**
```json
{
  "error": "Invalid email or password"
}
```
**500 Internal Server Error:**
```json
{
  "error": "Server error, please try again later"
}
```
### 10. Get All Assigned Reports (For Departments)

- **Feature:** View all reports assigned to the logged-in department  
- **HTTP Method:** GET  
- **Endpoint Path:** `/api/departments/reports`  
- **Description:** Retrieves a list of all public utility reports assigned to the logged-in department (e.g., PWD, Electricity Board).

**Headers:**

Authorization: Bearer <jwt_token>

**Success Response (200 OK):**
```json
{
  "reports": [
    {
      "id": "r001",
      "category": "Road Block",
      "description": "Tree fallen on road near XYZ temple",
      "location": {
        "latitude": 15.2963,
        "longitude": 74.1235
      },
      "photoUrl": "https://link-to-image.jpg",
      "status": "In Progress",
      "timestamp": "2025-08-07T12:30:00Z",
      "reporter": {
        "name": "Saisha Gaude",
        "phone": "+919876543210"
      }
    },
    ...
  ]
}
```
#### Error Response:
**(401 Unauthorized):**
```json
{
  "error": "Unauthorized access"
}
```
### 11. Update Report Status (For Departments)

- **Feature:** Update the status of a reported issue  
- **HTTP Method:** PATCH  
- **Endpoint Path:** `/api/departments/reports/:reportId/status`  
- **Description:** Allows an authorized department to update the status of an assigned report to either `In Progress`, `Resolved`, or `Rejected`.

**Headers:**

Authorization: Bearer <jwt_token>

**Request Body:**
```json
{
  "status": "Resolved",
  "resolutionNote": "Tree cleared by team at 4:30 PM",
  "proofPhotoUrl": "https://cdn.example.com/resolved/tree-cleared.jpg"
}
```
> Note: proofPhotoUrl is optional but strongly recommended for transparency.

**Success Response (200 OK):**
```json
{
  "message": "Report status updated successfully",
  "updatedReport": {
    "id": "r001",
    "status": "Resolved",
    "resolutionNote": "Tree cleared by team at 4:30 PM",
    "proofPhotoUrl": "https://cdn.example.com/resolved/tree-cleared.jpg"
  }
}
```
#### Error Responses:
**400 Bad Request:**
```json
{
  "error": "Invalid status value"
}
```
**401 Unauthorized:**
```json
{
  "error": "Unauthorized access"
}
```
**403 Forbidden:**
```json
{
  "error": "You are not authorized to update this report"
}
```
### 12. Submit Feedback for a Report

- **Feature:** Allow users to provide feedback and rate the resolution of their report  
- **HTTP Method:** POST  
- **Endpoint Path:** `/api/reports/:reportId/feedback`  
- **Description:** Enables the reporting user to submit a 1–5 star rating and optional feedback after a report is marked as "Resolved".

**Headers:**

Authorization: Bearer <jwt_token>

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Resolved quickly, but cleaner could’ve done a better job."
}
```
> Note: comment is optional, but rating (1 to 5) is mandatory.

**Success Response (200 OK):**
```json
{
  "message": "Feedback submitted successfully",
  "feedback": {
    "reportId": "r001",
    "rating": 4,
    "comment": "Resolved quickly, but cleaner could’ve done a better job."
  }
}
```
#### Error Responses:
**400 Bad Request:**
```json
{
  "error": "Rating must be between 1 and 5"
}
```
**401 Unauthorized:**
```json
{
  "error": "Unauthorized access"
}
```
**403 Forbidden:**
```json
{
  "error": "You are not allowed to rate this report"
}
```
### 13. Department-Initiated Report via Emergency Call
This allows a department to log a report based on a phone call received from a user (e.g., in case of fire or urgent issue where user couldn't submit via app).

- **Feature:** Allow department to create a report based on a phone call received  
- **HTTP Method:** POST  
- **Endpoint Path:** `/api/departments/:departmentId/call-report`  
- **Description:** Enables the department to create a report on behalf of a user who contacted them via phone. This is useful for emergency cases or offline users.

**Headers:**

Authorization: Bearer <department_jwt_token>

**Request Body:**
```json
{
  "reporterName": "Ramesh Naik",
  "reporterPhone": "+919898989898",
  "category": "Fire Incident",
  "description": "Caller reported a fire in backyard",
  "location": {
    "latitude": 15.2950,
    "longitude": 74.1252
  }
}
```
> Note: All fields are mandatory except description.

**Success Response (201 Created):**
```json
{
  "message": "Report submitted based on call",
  "reportId": "r017",
  "status": "Pending"
}
```
#### Error Responses:
**400 Bad Request:**
```json
{
  "error": "Missing required fields"
}
```
401 Unauthorized:
```json
{
  "error": "Department authentication required"
}
```

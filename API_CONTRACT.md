# API Contract - Village Pulse

This document defines the API contract between the frontend and backend for the Village Pulse application. It ensures smooth integration and clear communication between the mobile app (for villagers), the web dashboard (for departments), and the backend server.

## Base URL
All API endpoints are prefixed with:  
`https://api.villagepulse.com/api/v1`
  
## Authentication Overview

- Authentication and user management are handled by Firebase Authentication.
  Users and departments authenticate via Firebase’s SDK using email/password or OTP.
- The backend does not manage passwords or user credentials directly. Instead, it verifies Firebase-issued JWT tokens on every protected API request.
- Each request to protected endpoints must include a valid Firebase JWT token in the Authorization header:
  `Authorization: Bearer <firebase_id_token>`
- Departments are predefined by the admin team in Firebase Authentication and can only login (no public registration). Role management is handled in Firebase or backend as needed.
- User IDs (uid) from Firebase are used as primary identifiers across the backend and database.
- Image uploads are stored in Firebase Cloud Storage, and URLs to those images are saved in the backend database.
- Notifications to users and departments about new reports, status updates, or alerts are delivered via Firebase Cloud Messaging, triggered by backend events.

---

## Data Models

> Note: User and Department id fields correspond to Firebase Authentication uid.

### User model
```json
{
  "uid": "string (Firebase user ID)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": {
    "latitude": "float",
    "longitude": "float",
    "village": "string (optional)"
  },
  "createdAt": "datetime"
}
```
### Department  model
```json
{
  "uid": "string (Firebase user ID)",
  "name": "string (e.g., PWD, Electricity)",
  "email": "string",
  "phone": "string",
  "assignedReports": ["r123", "r456"],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```
### Report model
```json
{
  "id": "string (auto-generated in backend DB)",
  "userUid": "string (Firebase UID of reporter)",
  "category": "string (e.g., Power Outage, Tree Fall)",
  "description": "string",
  "location": {
    "latitude": "float",
    "longitude": "float"
  },
  "imageUrl": "string (Firebase Storage URL, optional)",
  "status": "string (enum: 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected')",
  "departmentUid": "string (nullable; assigned department)",
  "teamLead": {
    "name": "string (optional)",
    "phone": "string (optional)"
  },
  "resolutionImageUrl": "string (Firebase Storage URL, optional)",
  "supportersCount": "integer",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```
### Feedback model
```json
{
  "id": "string (auto-generated)",
  "reportId": "string",
  "userId": "string",
  "rating": "integer (1-5)",
  "comment": "string (optional)",
  "createdAt": "datetime"
}
```

## Authentication & User Management APIs (Firebase JWT)

Since we're using Firebase Authentication, the backend won’t handle passwords or OTP generation directly. Instead, backend will verify Firebase-issued JWT tokens to authenticate users.

---

### 1. User Registration & Login

- Handled entirely by Firebase Authentication (client side)
- Users register or login via Firebase SDK in the mobile app using email/password or phone OTP
- No backend endpoints needed for registration/login

### 2. Backend Endpoint: Verify Firebase JWT & Get User Profile

- **Feature:** Verify Firebase token sent from client and fetch/create user record in backend DB
- **Method:** POST
- **Endpoint:** /api/auth/firebase-verify
- **Description:** Backend verifies Firebase JWT, creates user if new, and returns app-specific JWT token for further API calls.

**Request Headers:**
Authorization: Bearer <firebase_id_token>

**Success Response (200 OK):**
```json
{
  "message": "User authenticated",
  "token": "app_jwt_token",
  "user": {
    "id": "abc123",
    "name": "Firstname Lastname",
    "email": "user@example.com",
    "phone": "+91XXXXXXXXXX",
    "location": {
      "latitude": 15.2993,
      "longitude": 74.1240
    }
  }
}
```
**Error Responses:**
**401 Unauthorized (invalid Firebase token)**
```json
{ "error": "Invalid Firebase token" }
```
**500 Internal Server Error**
```json
{ "error": "Server error, please try again later" }
```

### 3. User Logout

- Handled client-side by Firebase SDK
- No backend endpoint needed

## Report Management APIs (Firebase Auth) 

- All endpoints require an Authorization header with a Firebase JWT token:
Authorization: Bearer <firebase_id_token>
- Image URLs should point to Firebase Cloud Storage or a trusted CDN. Backend must validate URL formats.

---

### 1. Report an Issue

- **Feature:** Submit a new public utility issue
- **Method:** POST
- **Endpoint:** /api/reports
- **Description:** Authenticated user submits an issue with category, description, location, optional image URL.

**Request Body:**
```json
{
  "category": "Fire",
  "description": "Fire near main road",
  "location": {
    "latitude": 15.2993,
    "longitude": 74.1240
  },
  "imageUrl": "https://example.com/photo.jpg" 
}
```
**Success Response (201 Created):**
```json
{
  "message": "Report submitted successfully",
  "id": "r12345"
}
```
**Error Responses:**
**400 Bad Request:**
```json
{ "error": "Missing required fields" }
```
**401 Unauthorized:**
```json
{ "error": "Invalid or missing token" }
```
**500 Internal Server Error:**
```json
{ "error": "Could not save report" }
```

### 2. View Nearby Reports

- **Feature:** Get reports around user's current location
- **HTTP Method:** GET
- **Endpoint Path:** /api/reports/nearby
- **Description:** Retrieves a list of recent public reports within a certain radius (e.g., 3 km) of the user’s current location. Helps users stay aware of local issues.

**Headers:**
Authorization: Bearer <firebase_id_token>

**Request Parameters (Query):**
`/api/reports/nearby?latitude=15.2993&longitude=74.1240&radius=3`

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
      "createdAt": "2025-08-01T10:00:00Z",
      "updatedAt": "2025-08-05T12:00:00Z",
"supportersCount": 3,
      "status": "Pending",
      "imageUrl": "https://example.com/power_issue.jpg"
    }
  ]
}
```
#### Error Responses:
**400 Bad Request:**
```json
{ "error": "Missing or invalid location parameters" }
```
**500 Internal Server Error:**
```json
{ "error": "Failed to fetch nearby reports" }
```
### 3. Report details

- **Feature:** Get Report Details by ID
- **Method:** GET  
- **Path:** /api/reports/:id  
- **Description:** Returns full details of a specific report (used on report details screen).

**Headers:**  
`Authorization: Bearer <firebase_id_token>`

### Success Response (200 OK):  
```json
{
  "report": {
    "id": "r001",
    "userId": "u123",
    "category": "Electricity",
    "description": "Streetlight not working near park",
    "status": "Pending",
    "location": {
      "latitude": 15.2993,
      "longitude": 74.1240
    },
    "imageUrl": "https://example.com/image.jpg",
    "departmentId": "d456",
    "teamLead": {
      "name": "John Doe",
      "phone": "+919999999999"
    },
    "resolutionImageUrl": "https://example.com/resolution.jpg",
    "supportersCount": 5,
    "createdAt": "2025-08-01T10:00:00Z",
    "updatedAt": "2025-08-05T12:00:00Z"
  }
}
```
### Errors:  
**401 Unauthorized:**
```json
{ "error": "Authentication required" }
```
**404 Not Found:** 
```json
{ "error": "Report not found" }
```
### 4. Receive Alerts for New Reports

- **Feature:** Notify users when a new report is posted nearby
- **HTTP Method:** GET
- **Endpoint Path:** /api/reports/alerts
- **Description:** Retrieves a list of newly submitted public reports within the user’s chosen radius since their last check. Useful for keeping residents informed about ongoing issues in their area.

**Headers:**
`Authorization: Bearer <firebase_id_token>`

**Request Parameters (Query):**
`/api/reports/alerts?latitude=15.2993&longitude=74.1240&radius=3&since=2025-08-09T10:00:00Z`

| Parameter |	 Type  | Required |	                    Description                      |
|-----------|--------|----------|------------------------------------------------------|
| latitude  |	float  |    Yes	  |               User’s current latitude                |
| longitude |	float	 |    Yes	  |               User’s current longitude               |
| radius	  | number |    No	  |       Search radius in kilometers (default: 3)       |
| since	    | string |    No	  | ISO timestamp to fetch only reports created after it |

>If since omitted, return reports from the last 24 hours.
>If since provided, return reports created after that timestamp.
>The backend will use Firebase Cloud Messaging (FCM) to send a push notification to the user's device when a new report is submitted within their defined alert radius. The user's device must be registered with the backend for this functionality.

**Success Response (200 OK):**
```json
{
  "newReports": [
    {
      "id": "r123",
      "category": "Power Outage",
      "description": "Electricity gone since 2 PM",
      "location": {
        "latitude": 15.3001,
        "longitude": 74.1239
      },
        "createdAt": "2025-08-01T10:00:00Z",
    "updatedAt": "2025-08-05T12:00:00Z",
"supportersCount": 3,
          "status": "Pending"
    }
  ]
}
```
**Error Responses:**
**400 Bad Request:**
```json
{ "error": "Missing or invalid location parameters" }
```
**401 Unauthorized:**
```json
{ "error": "Authentication required" }
```
**500 Internal Server Error:**
```json
{ "error": "Failed to fetch alerts" }
```
### 5. Get My Reports

- **Feature:** Fetch all reports submitted by the currently logged-in user  
- **HTTP Method:** GET  
- **Endpoint Path:** `/api/reports/my`  
- **Description:** Returns a list of reports submitted by the authenticated user. Useful for showing their reporting history on the user dashboard or app.

**Headers:**
`Authorization: Bearer <firebase_id_token>`

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
      "imageUrl": "https://example.com/tree.jpg",
      "status": "Resolved",
"supportersCount": 3,
      "createdAt": "2025-08-07T15:10:00Z",
    "updatedAt": "2025-08-05T12:00:00Z"
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
### 6. Support a Report
(Useful when multiple users report or support the same issue)
> Backend enforces that each user can support a report only once.
> Duplicate support attempts return 409 Conflict.

- **Feature:** Upvote / support an already submitted report  
- **HTTP Method:** POST  
- **Endpoint Path:** `/api/reports/:id/support`  
- **Description:** Allows a logged-in user to support (or agree with) a reported issue. Helps departments prioritize based on number of affected users.

**Headers:**
`Authorization: Bearer <firebase_id_token>`

**Request Parameters (Path):**
- `id` (string): Report ID to support

**Success Response (200 OK):**
```json
{
  "message": "You supported this report successfully",
  "id": "r789",
  "supportersCount": 3
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
### 6. Submit Feedback for a Report

- **Feature:** Allow users to optionally provide feedback and rate the resolution of their report  
- **HTTP Method:** POST  
- **Endpoint Path:** `/api/reports/:id/feedback`  
- **Description:** Enables the users to submit a 1–5 star rating and feedback after a report is marked as "Resolved".

**Headers:**
`Authorization: Bearer <firebase_id_token>`

> Backend must verify that the report status is "Resolved" before accepting feedback.

**Request Parameters (Path):**

`id`(string) - report ID for which feedback is being given. 

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Resolved quickly and efficiently."
}
```
**Success Response (201 Created):**
```json
{
  "message": "Feedback submitted successfully",
  "feedback": {
    "id": "r001",
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
```json
{
  "error": "Report must be marked 'Resolved' before feedback can be submitted"
}
```
**401 Unauthorized:**
```json
{
  "error": "Unauthorized access"
}
```
**404 Not Found:**
```json
{
  "error": "Report not found"
}
```

# Department Management APIs (Firebase Auth)

- All endpoints require an Authorization header with a Firebase JWT token:
Authorization: Bearer <firebase_id_token>
- Backend must validate the Firebase token and verify department role.
- Image URLs should point to Firebase Cloud Storage or trusted CDN.
- Notifications triggered on status updates and resolution uploads (implementation assumed on backend).
  
---

## 1. Department Login

> Since we use Firebase Authentication, department login is handled by Firebase SDK on the frontend. Backend APIs require the Firebase JWT token for authorization.
No separate login endpoint needed here.

## 2. Get All Assigned Reports 

- **Feature:** View all reports assigned to the logged-in department  
- **HTTP Method:** GET  
- **Endpoint Path:** `/api/departments/reports`  
- **Description:** Retrieves a list of all public utility reports assigned to the logged-in department (e.g., PWD, Electricity Board).

**Headers:**

Authorization: Bearer <firebase_id_token>

**Query Parameter:**

|Parameter|	Type |Required| 	Description                                                           |
|---------|------|--------|-------------------------------------------------------------------------|
|status	  |string|	No    |Filter reports by status (e.g., Pending, Assigned, In Progress, Resolved)|
|category |string|	No	  |Filter reports by category name                                          |
|page     |	int  |	No	  |Pagination page number (default: 1)                                      |
|limit	  |int	 |No      |	Number of reports per page (default: 20)                                |

?status=<string>&category=<string>&page=<int>&limit=<int>

**Success Response (200 OK):**
```json
{
  "reports": [
    {
      "id": "r001",
      "category": "Road Block",
      "description": "Tree fallen on road near XYZ temple",
      "location": { "latitude": 15.2963, "longitude": 74.1235 },
      "imageUrl": "https://firebasestorage.googleapis.com/.../r001.jpg",
      "status": "In Progress",
      "createdAt": "2025-07-01T10:00:00Z",
      "updatedAt": "2025-07-05T12:00:00Z",
      "reporter": { "id": "u123", "name": "Firstname Lastname", "phone": "+918888888888" }
    }
  ],
  "page": 1,
  "limit": 20,
  "totalReports": 100
}
```
#### Error Response:
**(401 Unauthorized):**
```json
{
  "error": "Unauthorized access"
}
```

 ### 3. Receive alerts for New Reports 

- **Feature:** Notify departments when a new relevant report is submitted
- **HTTP Method:** GET
- **Endpoint Path:** /api/departments/reports/alerts
- **Description:** Retrieves newly created reports relevant to the logged-in department’s category and jurisdiction that are still pending or unassigned.

**Headers:**

Authorization: Bearer <firebase_id_token>

**Push Notification Payload:**
```json
{
  "notification": {
    "title": "New Report Alert",
    "body": "Tree blocking road at XYZ junction"
  },
  "data": {
    "id": "r456",
    "category": "Road Block",
    "status": "Pending"
  }
}
```
**Success Response (200 OK):**
```json
{
  "newReports": [
    {
      "id": "r456",
      "category": "Road Block",
      "description": "Tree blocking road at XYZ junction",
      "location": { "latitude": 15.2963, "longitude": 74.1235 },
      "createdAt": "2025-07-01T10:00:00Z",
      "updatedAt": "2025-07-05T12:00:00Z",
      "reporter": { "id":"u456", "name":"Rajesh Sharma", "phone":"+919988776655" },
      "status": "Pending"
    }
  ]
}
```

### 4. Update Report Status 

- **Feature:** Update the status of a reported issue and optionally attach proof of resolution
- **HTTP Method:** PATCH  
- **Endpoint Path:** `/api/departments/reports/:id`  
- **Description:** Allows an authorized department to update the status of an assigned report. The endpoint can also ne used to add resolution images when the report is marked as Resolved.

**Headers:**
Authorization: Bearer <firebase_id_token>

**Request Body:**
```json
{
  "status": "Resolved",
  "teamLead": { "name": "Firstname Lastname", "phone": "+912222222222" },
  "resolutionNote": "Tree cleared by team at 4:30 PM",
  "resolutionImageUrls": ["https://firebasestorage.googleapis.com/.../r001-cleared.jpg"]
}
```
**Success Response (200 OK):**
```json
{
  "message": "Report status and/or resolution proof updated successfully",
  "updatedReport": {
    "id": "r001",
    "status": "Resolved",
    "teamLead": { "name": "Firstname Lastname", "phone": "+912222222222" },
    "resolutionNote": "Tree cleared by team at 4:30 PM",
    "resolutionImageUrls": ["https://firebasestorage.googleapis.com/.../r001-cleared.jpg"],
    "updatedAt": "2025-08-09T15:00:00Z"
  },
  "notification": {
    "sent": true
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
**500 Internal Server Error:**
```json
{
  "error": "Failed to send notification to user"
}
```
> Note: On successful status update, backend triggers notification to report owner and supporters.

## 6. View Past Reports

- **Feature:** Fetch historical reports (Resolved or all) with filters
- **HTTP Method:** GET
- **Endpoint:** /api/departments/reports/past
- **Description:** Get past reports, filterable by date, status, category, etc.

**Headers:**
Authorization: Bearer <firebase_id_token>

**Query Parameters:**

|Parameter| Type |Required|	Description                     |
|---------|------|--------|---------------------------------|                                
|status   |string|	 No   |Filter by status (Resolved, etc.)|
|category |string|	 No	  |Filter by category               |
|startDate|string|	 No	  |ISO date to filter from          |
|endDate  |string| 	 No	  |ISO date to filter to            |
|page	    |int   |	 No	  |Pagination page (default: 1)     |
|limit    |int   |	 No	  |Pagination limit (default: 20)   |

**Success Response (200 OK):**
```json
{
  "message": "Past reports fetched successfully",
  "reports": [
    {
      "id": "r12345",
      "category": "Garbage",
      "description": "Garbage pile cleared",
      "location": {
        "latitude": 15.3001,
        "longitude": 74.1239
      },
      "status": "Resolved",
      "createdAt": "2025-07-01T10:00:00Z",
      "updatedAt": "2025-07-05T12:00:00Z",
      "resolutionImageUrls": [
        "https://firebasestorage.googleapis.com/v0/b/example.appspot.com/o/resolution1.jpg"
      ],
      "supportersCount": 10,
      "imageUrl": "https://example.com/garbage.jpg"
    }
  ],
  "page": 1,
  "limit": 20,
  "totalReports": 50
}
```
**Error Responses:**
**401 Unauthorized:**
```json
{ "error": "Authentication required" }
```
**403 Forbidden:**
```json
{ "error": "Access denied: department role required" }
```
**500 Internal Server Error:**
```json
{ "error": "Failed to fetch past reports" }
```
### 7. View Feedback for a Report 

- **Feature:** Retrieve all feedback entries for a given report.
- **HTTP Method:** GET
- **Endpoint Path:** /api/departments/reports/:id/feedback
- **Description:** Allows the logged-in department to see feedback and ratings left by users for that specific report.

**Headers:**

Authorization: Bearer <firebase_id_token>

**Success Response (200 OK):**
```json
{
  "reportId": "r001",
  "feedback": [
    {
      "userId":"u123",
      "rating": 4,
      "comment": "Resolved quickly.",
      "submittedBy": "John Fernandes",
      "submittedAt": "2025-08-09T15:30:00Z"
    },
    {
      "userId":"u1230",
      "rating": 5,
      "comment": "Excellent work!",
      "submittedBy": "Priya Naik",
      "submittedAt": "2025-08-09T16:00:00Z"
    }
  ]
}
```
#### Error Responses:
**401 Unauthorized:**
```json
{
  "error": "Department authentication required"
}
```
**404 Not Found:**
```json
{
  "error": "Report not found"
}
```
**500 Internal Server Error:**
```json
{
  "error": "Could not fetch feedback for this report"
}
```
### 8. Department-Initiated Report via Emergency Call
This allows a department to log a report based on a phone call received from a user (e.g., in case of fire or urgent issue where user couldn't submit via app).

- **Feature:** Allow department to create a report based on a phone call received  
- **HTTP Method:** POST  
- **Endpoint Path:** `/api/departments/:departmentId/call-report`  
- **Description:** Enables the department to create a report on behalf of a user who contacted them via phone. This is useful for emergency cases or offline users.

**Headers:**

Authorization: Bearer <firebase_id_token>

**Request Body:**
```json
{
  "reporterName": "firstname lastname",
  "reporterPhone": "+910000000000",
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
  "id": "r017",
  "status": "Pending",
  "createdAt": "2025-08-11T08:00:00Z"
}
```
#### Error Responses:
**400 Bad Request:**
```json
{
  "error": "Missing required fields"
}
```
**401 Unauthorized:**
```json
{
  "error": "Department authentication required"
}
```
## 9. Register Department Device for Push Notifications

- **Feature:** Register a department device's FCM token so it can receive push notifications about new reports, status updates, etc.
- **HTTP Method:** POST
- **Endpoint Path:** /api/departments/device/register
- **Description:** Allows a logged-in department user to register their device’s Firebase Cloud Messaging (FCM) token for receiving notifications.

**Headers:**
Authorization: Bearer <firebase_id_token>
Content-Type: application/json

**Request Body:**
```json
{ "deviceToken": "FCM device token string" }
```
**Success Response (200 OK):**
```json
{ "message": "Device registered for notifications" }
```
**Error Responses:**
**400 Bad Request:**
```json
{ "error": "deviceToken is required" }
```
**401 Unauthorized:**
```json
{ "error": "Invalid or expired Firebase token" }
```
**500 Internal Server Error:**
```json
{ "error": "Failed to register device token" }
```

## 10. Assign Report to Team 

- **Feature:** Assign a report to a specific department team or worker for action.
- **HTTP Method:** PATCH
- **Endpoint Path:** /api/departments/reports/:id/assign
- **Description:** Allows an authorized department user to assign the report to a team.

**Headers:**
Authorization: Bearer <firebase_id_token>
Content-Type: application/json

**Path Parameters:**
|Parameter|Type  |Description               |
|---------|------|--------------------------|
|id	      |string|ID of the report to assign|

**Request Body:**
```json
{ "teamLead": "tl001" }
```
> Note: At least one of teamId or workerId must be provided. Both can be provided if assigning a worker within a team.
**Success Response (200 OK):**
```json
{
  "message": "Report assigned successfully",
  "id": "r001",
  "assignedTo": {
    "teamLead": "tl001",
  },
  "updatedAt": "2025-08-11T10:00:00Z"
}
```
**Error Responses:**
**400 Bad Request:**
```json
{ "error": "Either teamLead must be provided" }
```
**401 Unauthorized:**
```json
{ "error": "Unauthorized access" }
```
**403 Forbidden:**
```json
{ "error": "Access denied: department role required" }
```
**404 Not Found:**
```json
{ "error": "Report not found" }
```
**500 Internal Server Error:**
```json
{ "error": "Failed to assign report" }
```

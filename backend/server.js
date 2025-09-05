const express = require('express');
const cors = require('cors');
const app = express();
const corsOptions = {
  origin: 'http://localhost:8081',  // frontend origin to allow
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use(express.json());

const { swaggerUi, swaggerSpec } = require('./swagger');
const data = require('./data');
const { v4: uuidv4 } = require('uuid');

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const API_PREFIX = '/api/v1';

// ---- MOCK AUTH ----
function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid or missing token' });
  }
  req.user = { id: 'testUserId', role: 'user', name: 'Test User' };
  next();
}

function verifyDepartmentRole(req, res, next) {
  verifyFirebaseToken(req, res, () => {
    req.user.role = 'department';
    req.user.departmentId = 'electricity';
    next();
  });
}
/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       properties:
 *         latitude: { type: number }
 *         longitude: { type: number }
 *         village: { type: string, nullable: true }
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         email: { type: string }
 *         phone: { type: string }
 *         location: { $ref: '#/components/schemas/Location' }
 *         createdAt: { type: string }
 *         updatedAt: { type: string }
 *     Report:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         userId: { type: string }
 *         category: { type: string }
 *         description: { type: string }
 *         location:
 *           type: object
 *           properties:
 *             latitude: { type: number }
 *             longitude: { type: number }
 *             village: { type: string }
 *         imageUrl: { type: string }
 *         status: { type: string }
 *         supportersCount: { type: integer }
 *         createdAt: { type: string }
 *         updatedAt: { type: string }
 *         resolutionNote: { type: string }
 *         resolutionImageUrls:
 *           type: array
 *           items: { type: string }
 *         departmentId: { type: string }
 *         teamLead:
 *           type: object
 *           additionalProperties: true
 *     Feedback:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         reportId: { type: string }
 *         userId: { type: string }
 *         rating: { type: integer }
 *         comment: { type: string }
 *         createdAt: { type: string }
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root welcome route
 *     responses:
 *       200:
 *         description: Welcome message confirming backend is running
 */
app.get('/', (req, res) => {
  res.send('Village Pulse backend is running. Visit https://villagepulse-fivestack.onrender.com/api-docs/ for API documentation.');
});

// ---------- AUTH ----------
/**
 * @swagger
 * /api/v1/auth/firebase-verify:
 *   post:
 *     summary: Verify Firebase JWT and get or create user profile
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: User authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401: { description: Invalid Firebase token }
 */
app.post(`${API_PREFIX}/auth/firebase-verify`, verifyFirebaseToken, (req, res) => {
  let user = data.users.find(u => u.id === req.user.id);
  if (!user) {
    user = {
      id: req.user.id,
      name: req.user.name,
      email: 'test@example.com',
      phone: '+919999999999',
      location: { latitude: 0, longitude: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    data.users.push(user);
  }
  res.json({ message: 'User authenticated', token: 'app_jwt_token', user });
});

// ---------- REPORTS ----------
/**
 * @swagger
 * /api/v1/reports:
 *   post:
 *     summary: Report an issue
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - category
 *               - description
 *               - location
 *             properties:
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 $ref: '#/components/schemas/Location'
 *               imageUrl:
 *                 type: string
 *           example:
 *             category: "Electricity"
 *             description: "Streetlight not working in main street"
 *             location:
 *               latitude: 15.3
 *               longitude: 74.14
 *               village: "Ponda"
 *             imageUrl: "https://example.com/streetlight.jpg"
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *             example:
 *               message: "Report submitted successfully"
 *               id: "550e8400-e29b-41d4-a716-446655440000"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Missing required fields"
 */
app.post(`${API_PREFIX}/reports`, verifyFirebaseToken, (req, res) => {
  const { category, description, location, imageUrl } = req.body;
  if (!category || !description || !location?.latitude || !location?.longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = uuidv4();
  const report = {
    id,
    userId: req.user.id,
    category,
    description,
    location,
    imageUrl: imageUrl || null,
    status: 'Pending',
    supportersCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  data.reports.push(report);
  res.status(201).json({ message: 'Report submitted successfully', id });
});

/**
 * @swagger
 * /api/v1/reports/alerts:
 *   get:
 *     summary: Get new report alerts near user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude of user location
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude of user location
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         required: false
 *         description: Search radius in km (default 3)
 *       - in: query
 *         name: since
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Return new reports created after this ISO date-time
 *     responses:
 *       200:
 *         description: New reports fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newReports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *             example:
 *               newReports:
 *                 - id: "uuid-generated"
 *                   userId: "testUserId"
 *                   category: "Auto-Test"
 *                   description: "Auto-generated for /alerts"
 *                   location:
 *                     latitude: 15.3
 *                     longitude: 74.14
 *                     village: "TestVille"
 *                   status: "Pending"
 *                   supportersCount: 0
 *                   createdAt: "2025-08-12T07:14:21.750Z"
 *                   updatedAt: "2025-08-12T07:14:21.750Z"
 *                   departmentId: "electricity"
 *                   teamLead: {}
 *                   resolutionNote: ""
 *                   resolutionImageUrls: []
 */
app.get('/api/v1/reports/alerts', verifyFirebaseToken, (req, res) => {
  const { latitude, longitude, radius = 3, since } = req.query;
  const latNum = Number(latitude);
  const lonNum = Number(longitude);

  if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
    return res.status(400).json({ error: 'Missing or invalid location parameters' });
  }

  let locationFiltered = data.reports.filter(r =>
    Math.abs(r.location.latitude - latNum) <= 0.03 * radius &&
    Math.abs(r.location.longitude - lonNum) <= 0.03 * radius
  );

  let timeFiltered;
  if (since) {
    const sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return res.status(400).json({ error: 'Invalid "since" date format' });
    }
    timeFiltered = locationFiltered.filter(r => new Date(r.createdAt) > sinceDate);
  } else {
    const cutoff = new Date(Date.now() - 24*60*60*1000);
    timeFiltered = locationFiltered.filter(r => new Date(r.createdAt) > cutoff);
  }

  if (timeFiltered.length === 0) {
    const autoReport = {
      id: uuidv4(),
      userId: req.user.id,
      category: 'Auto-Test',
      description: 'Auto-generated for /alerts',
      location: { latitude: latNum, longitude: lonNum, village: 'TestVille' },
      imageUrl: null,
      status: 'Pending',
      supportersCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      departmentId: 'electricity',
      teamLead: {},
      resolutionNote: '',
      resolutionImageUrls: []
    };
    data.reports.push(autoReport);
    timeFiltered.push(autoReport);
  }

  res.status(200).json({ newReports: timeFiltered });
});

/**
 * @swagger
 * /api/v1/reports/nearby:
 *   get:
 *     summary: Get nearby reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude of the current location
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude of the current location
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         required: false
 *         description: Search radius in kilometers (default is 3)
 *     responses:
 *       200:
 *         description: Nearby reports fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *             example:
 *               message: "Nearby reports fetched successfully"
 *               reports:
 *                 - id: "e5f2a7d8-909f-4a6a-b38f-239d938a7ed2"
 *                   userId: "mockUserId"
 *                   category: "Electricity"
 *                   description: "Streetlight not working in main street"
 *                   location:
 *                     latitude: 15.3
 *                     longitude: 74.14
 *                     village: "Ponda"
 *                   imageUrl: "https://example.com/streetlight.jpg"
 *                   status: "Pending"
 *                   departmentId: null
 *                   teamLead: {}
 *                   resolutionImageUrls: []
 *                   resolutionNote: ""
 *                   supportersCount: 1
 *                   createdAt: "2025-08-12T07:14:21.750Z"
 *                   updatedAt: "2025-08-12T07:14:21.750Z"
 *       400:
 *         description: Missing or invalid location parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Missing or invalid location parameters"
 */
app.get(`${API_PREFIX}/reports/nearby`, verifyFirebaseToken, (req, res) => {
  const { latitude, longitude, radius = 3 } = req.query;
  const latNum = Number(latitude), lonNum = Number(longitude);
  if (!latNum || !lonNum) return res.status(400).json({ error: 'Missing or invalid location parameters' });
  const results = data.reports.filter(r =>
    Math.abs(r.location.latitude - latNum) <= 0.03 * radius &&
    Math.abs(r.location.longitude - lonNum) <= 0.03 * radius
  );
  res.json({ message: 'Nearby reports fetched successfully', reports: results });
});

/**
 * @swagger
 * /api/v1/reports/my:
 *   get:
 *     summary: Get reports submitted by current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's reports fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *             example:
 *               message: "Your reports fetched successfully"
 *               reports:
 *                 - id: "uuid-generated"
 *                   userId: "testUserId"
 *                   category: "Auto-Test"
 *                   description: "Auto-generated for /my"
 *                   location:
 *                     latitude: 15.3
 *                     longitude: 74.14
 *                     village: "TestVille"
 *                   status: "Pending"
 *                   supportersCount: 0
 *                   createdAt: "2025-08-12T07:14:21.750Z"
 *                   updatedAt: "2025-08-12T07:14:21.750Z"
 *                   departmentId: "electricity"
 *                   teamLead: {}
 *                   resolutionNote: ""
 *                   resolutionImageUrls: []
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Invalid or missing token"
 */
app.get(`${API_PREFIX}/reports/my`, verifyFirebaseToken, (req, res) => {
  let myReports = data.reports.filter(r => r.userId === req.user.id);

  if (myReports.length === 0) {
    const { v4: uuidv4 } = require('uuid');
    const newReport = {
      id: uuidv4(),
      userId: req.user.id,
      category: 'Auto-Test',
      description: 'Auto-generated for /my',
      location: { latitude: 15.3, longitude: 74.14, village: 'TestVille' },
      imageUrl: null,
      status: 'Pending',
      supportersCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      departmentId: 'electricity',
      teamLead: {},
      resolutionNote: '',
      resolutionImageUrls: []
    };
    data.reports.push(newReport);
    myReports.push(newReport);
    console.log('[DEBUG] Auto-created report for /my');
  }

  res.status(200).json({ message: 'Your reports fetched successfully', reports: myReports });
});

/**
 * @swagger
 * /api/v1/reports/{id}:
 *   get:
 *     summary: Get report details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique report ID to fetch
 *     responses:
 *       200:
 *         description: Report details returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *             example:
 *               report:
 *                 id: "e5f2a7d8-909f-4a6a-b38f-239d938a7ed2"
 *                 userId: "mockUserId"
 *                 category: "Electricity"
 *                 description: "Streetlight not working in main street"
 *                 location:
 *                   latitude: 15.3
 *                   longitude: 74.14
 *                   village: "Ponda"
 *                 imageUrl: "https://example.com/streetlight.jpg"
 *                 status: "Pending"
 *                 departmentId: null
 *                 teamLead: {}
 *                 resolutionImageUrls: []
 *                 resolutionNote: ""
 *                 supportersCount: 1
 *                 createdAt: "2025-08-12T07:14:21.750Z"
 *                 updatedAt: "2025-08-12T07:14:21.750Z"
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Report not found"
 */
app.get(`${API_PREFIX}/reports/:id`, verifyFirebaseToken, (req, res) => {
  const report = data.reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json({ report });
});

/**
 * @swagger
 * /api/v1/reports/{id}/support:
 *   post:
 *     summary: Support a specific report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique ID of the report you want to support
 *     responses:
 *       200:
 *         description: You supported this report successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *                 supportersCount:
 *                   type: integer
 *             example:
 *               message: "You supported this report successfully"
 *               id: "e5f2a7d8-909f-4a6a-b38f-239d938a7ed2"
 *               supportersCount: 4
 *       409:
 *         description: Already supported this report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "You have already supported this report"
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Report not found"
 */
app.post(`${API_PREFIX}/reports/:id/support`, verifyFirebaseToken, (req, res) => {
  const report = data.reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (!data.supportedReports[report.id]) data.supportedReports[report.id] = new Set();
  if (data.supportedReports[report.id].has(req.user.id)) {
    return res.status(409).json({ error: 'You have already supported this report' });
  }
  data.supportedReports[report.id].add(req.user.id);
  report.supportersCount++;
  res.json({ message: 'You supported this report successfully', id: report.id, supportersCount: report.supportersCount });
});

/**
 * @swagger
 * /api/v1/reports/{id}/feedback:
 *   post:
 *     summary: Submit feedback for a resolved report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique report ID to submit feedback for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *           example:
 *             rating: 5
 *             comment: "Quick response and issue resolved!"
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 feedback: { $ref: '#/components/schemas/Feedback' }
 *             example:
 *               message: "Feedback submitted successfully"
 *               feedback:
 *                 id: "abc123-xyz"
 *                 reportId: "e5f2a7d8-909f-4a6a-b38f-239d938a7ed2"
 *                 userId: "mockUserId"
 *                 rating: 5
 *                 comment: "Quick response and issue resolved!"
 *                 createdAt: "2025-08-12T14:12:21.750Z"
 *       400:
 *         description: Report must be marked 'Resolved' before feedback can be submitted, or rating out of bounds
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Report must be marked 'Resolved' before feedback can be submitted"
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Report not found"
 */
app.post(`${API_PREFIX}/reports/:id/feedback`, verifyFirebaseToken, (req, res) => {
  const { rating, comment } = req.body;
  const report = data.reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (report.status !== 'Resolved') return res.status(400).json({ error: "Report must be marked 'Resolved'" });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  const feedback = { id: uuidv4(), reportId: report.id, userId: req.user.id, rating, comment: comment || '', createdAt: new Date() };
  data.feedbacks.push(feedback);
  res.status(201).json({ message: 'Feedback submitted successfully', feedback });
});

// ---------- DEPARTMENTS ----------
/**
 * @swagger
 * /api/v1/departments/reports:
 *   get:
 *     summary: Get all reports for current department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by report status ("Pending", "Resolved", etc.)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by report category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Reports per page (default is 20)
 *     responses:
 *       200:
 *         description: Department reports fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalReports:
 *                   type: integer
 *             example:
 *               reports:
 *                 - id: "e5f2a7d8-909f-4a6a-b38f-239d938a7ed2"
 *                   userId: "mockUserId"
 *                   category: "Electricity"
 *                   description: "Streetlight not working in main street"
 *                   location:
 *                     latitude: 15.3
 *                     longitude: 74.14
 *                     village: "Ponda"
 *                   status: "Pending"
 *                   supportersCount: 2
 *                   createdAt: "2025-08-12T07:14:21.750Z"
 *                   updatedAt: "2025-08-12T07:14:21.750Z"
 *                   imageUrl: "https://example.com/streetlight.jpg"
 *                   departmentId: "mockDepartmentId"
 *                   teamLead: {}
 *                   resolutionImageUrls: []
 *                   resolutionNote: ""
 *               page: 1
 *               limit: 20
 *               totalReports: 1
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Invalid or missing token"
 */
app.get(`${API_PREFIX}/departments/reports`, verifyDepartmentRole, (req, res) => {
  const { status, category, page = 1, limit = 20 } = req.query;
  let reports = data.reports.filter(r => r.departmentId === req.user.departmentId);
  if (status) reports = reports.filter(r => r.status === status);
  if (category) reports = reports.filter(r => r.category === category);
  const totalReports = reports.length;
  reports = reports.slice((page - 1) * limit, page * limit);
  res.json({ reports, page: Number(page), limit: Number(limit), totalReports });
});

/**
 * @swagger
 * /api/v1/departments/reports/alerts:
 *   get:
 *     summary: Get new relevant reports for department
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New relevant reports fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newReports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *             example:
 *               newReports:
 *                 - id: "e5f2a7d8-909f-4a6a-b38f-239d938a7ed2"
 *                   userId: "mockUserId"
 *                   category: "Electricity"
 *                   description: "Streetlight not working in main street"
 *                   location:
 *                     latitude: 15.3
 *                     longitude: 74.14
 *                     village: "Ponda"
 *                   imageUrl: "https://example.com/streetlight.jpg"
 *                   status: "Pending"
 *                   departmentId: null
 *                   teamLead: {}
 *                   resolutionImageUrls: []
 *                   resolutionNote: ""
 *                   supportersCount: 1
 *                   createdAt: "2025-08-12T07:14:21.750Z"
 *                   updatedAt: "2025-08-12T07:14:21.750Z"
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Invalid or missing token"
 */
app.get(`${API_PREFIX}/departments/reports/alerts`, verifyDepartmentRole, (req, res) => {
  let reports = data.reports.filter(r => r.status === 'Pending' || !r.departmentId);
  res.json({ newReports: reports });
});

/**
 * @swagger
 * /api/v1/departments/reports/{id}:
 *   patch:
 *     summary: Update report status or add resolution proof
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique report ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status ("Pending", "In Progress", "Resolved", etc.)
 *               teamLead:
 *                 type: string
 *                 description: Assign team lead to the report
 *               resolutionNote:
 *                 type: string
 *                 description: Explanation of how the problem was resolved
 *               resolutionImageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Photos as proof of resolution
 *           example:
 *             status: "Resolved"
 *             teamLead: "Suresh Pawar"
 *             resolutionNote: "Streetlight wiring replaced, now working fine."
 *             resolutionImageUrls:
 *               - "https://example.com/proof1.jpg"
 *               - "https://example.com/proof2.jpg"
 *     responses:
 *       200:
 *         description: Report status and/or resolution proof updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedReport:
 *                   $ref: '#/components/schemas/Report'
 *                 notification:
 *                   type: object
 *                   properties:
 *                     sent:
 *                       type: boolean
 *             example:
 *               message: "Report status and/or resolution proof updated successfully"
 *               updatedReport:
 *                 id: "e5f2a7d8-909f-4a6a-b38f-239d938a7ed2"
 *                 userId: "mockUserId"
 *                 category: "Electricity"
 *                 description: "Streetlight not working in main street"
 *                 location:
 *                   latitude: 15.3
 *                   longitude: 74.14
 *                   village: "Ponda"
 *                 status: "Resolved"
 *                 teamLead: "Suresh Pawar"
 *                 resolutionNote: "Streetlight wiring replaced, now working fine."
 *                 resolutionImageUrls:
 *                   - "https://example.com/proof1.jpg"
 *                   - "https://example.com/proof2.jpg"
 *                 supportersCount: 2
 *                 createdAt: "2025-08-12T07:14:21.750Z"
 *                 updatedAt: "2025-08-12T15:22:45.900Z"
 *                 departmentId: "mockDepartmentId"
 *               notification:
 *                 sent: true
 *       400:
 *         description: Bad request (missing or invalid data)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Missing required fields"
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Report not found"
 */
app.patch(`${API_PREFIX}/departments/reports/:id`, verifyDepartmentRole, (req, res) => {
  const report = data.reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const { status, teamLead, resolutionNote, resolutionImageUrls } = req.body;
  if (status) report.status = status;
  if (teamLead) report.teamLead = teamLead;
  if (resolutionNote) report.resolutionNote = resolutionNote;
  if (resolutionImageUrls) report.resolutionImageUrls = resolutionImageUrls;
  report.updatedAt = new Date();
  res.json({ message: 'Report status and/or resolution proof updated successfully', updatedReport: report, notification: { sent: true } });
});

/**
 * @swagger
 * /api/v1/departments/reports/past:
 *   get:
 *     summary: Get past reports for department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by report status (e.g., "Resolved", "Pending")
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by report category (e.g., "Electricity")
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: ISO date-time for earliest report creation
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: ISO date-time for latest report creation
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Results per page (default 20)
 *     responses:
 *       200:
 *         description: Past reports fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalReports:
 *                   type: integer
 *             example:
 *               message: "Past reports fetched successfully"
 *               reports:
 *                 - id: "e5f2a7d8-909f-4a6a-b38f-239d938a7ed2"
 *                   userId: "mockUserId"
 *                   category: "Electricity"
 *                   description: "Streetlight not working in main street"
 *                   location:
 *                     latitude: 15.3
 *                     longitude: 74.14
 *                     village: "Ponda"
 *                   imageUrl: "https://example.com/streetlight.jpg"
 *                   status: "Resolved"
 *                   departmentId: "mockDepartmentId"
 *                   teamLead: "Suresh Pawar"
 *                   resolutionImageUrls:
 *                     - "https://example.com/proof1.jpg"
 *                   resolutionNote: "Streetlight wiring replaced, now working fine."
 *                   supportersCount: 2
 *                   createdAt: "2025-08-12T07:14:21.750Z"
 *                   updatedAt: "2025-08-12T15:22:45.900Z"
 *               page: 1
 *               limit: 20
 *               totalReports: 1
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Invalid or missing token"
 */
app.get(`${API_PREFIX}/departments/reports/past`, verifyDepartmentRole, (req, res) => {
  const { status, category, startDate, endDate, page = 1, limit = 20 } = req.query;
  let reports = data.reports;
  if (status) reports = reports.filter(r => r.status === status);
  if (category) reports = reports.filter(r => r.category === category);
  if (startDate) reports = reports.filter(r => new Date(r.createdAt) >= new Date(startDate));
  if (endDate) reports = reports.filter(r => new Date(r.createdAt) <= new Date(endDate));
  const totalReports = reports.length;
  reports = reports.slice((page - 1) * limit, page * limit);
  res.json({ message: 'Past reports fetched successfully', reports, page: Number(page), limit: Number(limit), totalReports });
});

/**
 * @swagger
 * /api/v1/departments/reports/{id}/feedback:
 *   get:
 *     summary: Get all feedback for a report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique report ID to fetch feedback for
 *     responses:
 *       200:
 *         description: Feedback found for report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reportId:
 *                   type: string
 *                 feedback:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Feedback'
 *             example:
 *               reportId: "e5f2a7d8-909f-4a6a-b38f-239d938a7ed2"
 *               feedback:
 *                 - id: "abc123-xyz"
 *                   reportId: "e5f2a7d8-909f-4a6a-b38f-239d938a7ed2"
 *                   userId: "mockUserId"
 *                   rating: 5
 *                   comment: "Quick and clear fix, thanks!"
 *                   createdAt: "2025-08-12T14:40:21.750Z"
 *                 - id: "def456-pqr"
 *                   reportId: "e5f2a7d8-909f-4a6a-b38f-239d938a7ed2"
 *                   userId: "anotherUser"
 *                   rating: 3
 *                   comment: "Resolved, but took time"
 *                   createdAt: "2025-08-13T11:10:31.000Z"
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Report not found"
 */
app.get(`${API_PREFIX}/departments/reports/:id/feedback`, verifyDepartmentRole, (req, res) => {
  const report = data.reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const feedbacks = data.feedbacks.filter(f => f.reportId === report.id);
  res.json({ reportId: report.id, feedback: feedbacks });
});

/**
 * @swagger
 * /api/v1/departments/{departmentId}/call-report:
 *   post:
 *     summary: Department creates report from received phone call
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: The department for which the report is being logged
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - reporterName
 *               - reporterPhone
 *               - category
 *               - location
 *             properties:
 *               reporterName:
 *                 type: string
 *                 description: Name of the caller/reporter
 *               reporterPhone:
 *                 type: string
 *                 description: Phone number of the caller/reporter
 *               category:
 *                 type: string
 *                 description: Issue category ("Water Supply", "Electricity", etc.)
 *               description:
 *                 type: string
 *                 description: Description of the issue
 *               location:
 *                 $ref: '#/components/schemas/Location'
 *           example:
 *             reporterName: "John Doe"
 *             reporterPhone: "+911234567890"
 *             category: "Water Supply"
 *             description: "Broken water pipe near school"
 *             location:
 *               latitude: 15.31
 *               longitude: 74.15
 *               village: "Ponda"
 *     responses:
 *       201:
 *         description: Report submitted based on call
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 id: { type: string }
 *                 status: { type: string }
 *                 createdAt: { type: string }
 *             example:
 *               message: "Report submitted based on call"
 *               id: "b6ae5da2-63ec-4c62-a6b2-6da28ff30c2b"
 *               status: "Pending"
 *               createdAt: "2025-08-12T15:45:23.125Z"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string }
 *             example:
 *               error: "Missing required fields"
 */
app.post(`${API_PREFIX}/departments/:departmentId/call-report`, verifyDepartmentRole, (req, res) => {
  const { reporterName, reporterPhone, category, description, location } = req.body;
  if (!reporterName || !reporterPhone || !category || !location?.latitude || !location?.longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = uuidv4();
  const report = { id, userId: `phone_${reporterPhone}`, category, description: description || '', location, imageUrl: null, status: 'Pending', supportersCount: 0, createdAt: new Date(), updatedAt: new Date(), departmentId: req.params.departmentId, teamLead: {}, resolutionImageUrls: [], resolutionNote: '' };
  data.reports.push(report);
  res.status(201).json({ message: 'Report submitted based on call', id, status: 'Pending', createdAt: report.createdAt });
});

/**
 * @swagger
 * /api/v1/departments/device/register:
 *   post:
 *     summary: Register department device for notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - deviceToken
 *             properties:
 *               deviceToken:
 *                 type: string
 *                 description: The FCM or notification token for the department device
 *           example:
 *             deviceToken: "testFCMToken123"
 *     responses:
 *       200:
 *         description: Device registered for notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Device registered for notifications"
 *       400:
 *         description: Device token missing from request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "deviceToken is required"
 */
app.post(`${API_PREFIX}/departments/device/register`, verifyDepartmentRole, (req, res) => {
  const { deviceToken } = req.body;
  if (!deviceToken) return res.status(400).json({ error: 'deviceToken is required' });
  if (!data.departmentDevices[req.user.departmentId]) {
    data.departmentDevices[req.user.departmentId] = new Set();
  }
  data.departmentDevices[req.user.departmentId].add(deviceToken);
  res.json({ message: 'Device registered for notifications' });
});

/**
 * @swagger
 * /api/v1/departments/reports/{id}/assign:
 *   patch:
 *     summary: Assign report to a team lead
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique report ID to assign
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - teamLead
 *             properties:
 *               teamLead:
 *                 type: string
 *                 description: Name of the team lead to assign
 *           example:
 *             teamLead: "Raj Kumar"
 *     responses:
 *       200:
 *         description: Report assigned to team lead successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *                 teamLead:
 *                   type: string
 *             example:
 *               message: "Report assigned to team lead successfully"
 *               id: "e5f2a7d8-909f-4a6a-b38f-239d938a7ed2"
 *               teamLead: "Raj Kumar"
 *       400:
 *         description: Missing required fields or invalid team lead
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Missing required fields"
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Report not found"
 */
app.patch(`${API_PREFIX}/departments/reports/:id/assign`, verifyDepartmentRole, (req, res) => {
  const report = data.reports.find(r => r.id === req.params.id);
  const { teamLead } = req.body;
  if (!teamLead) return res.status(400).json({ error: 'Either teamLead must be provided' });
  if (!report) return res.status(404).json({ error: 'Report not found' });
  report.teamLead = teamLead;
  report.updatedAt = new Date();
  res.json({ message: 'Report assigned successfully', id: report.id, assignedTo: { teamLead }, updatedAt: report.updatedAt });
});

// ----------- START SERVER -----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

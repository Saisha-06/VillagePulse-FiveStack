const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Village Pulse API',
      version: '1.0.0',
      description: 'API documentation for the Village Pulse system'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local dev server' }
    ],
    components: {
  securitySchemes: {
    bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
  },
  schemas: {
    Report: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        category: { type: 'string' },
        description: { type: 'string' },
        location: {
          type: 'object',
          properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            village: { type: 'string' }
          }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  }
}
},
 apis: ['./server.js']
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpec };

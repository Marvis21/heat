const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Heat - Cattle Management API',
      version: '1.0.0',
      description:
        'Backend API for the Heat cattle management application: herd management, oestrus tracking, ' +
        'symptom checking, and farm records (milk, breeding, health, feed, financial).',
    },
    servers: [{ url: `${env.apiPrefix}`, description: 'Current server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);

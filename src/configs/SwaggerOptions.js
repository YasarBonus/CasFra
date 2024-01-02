// swaggerOptions.js
module.exports = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'CasFra API',
        version: '0.9.0',
        description: 'CasFra API Documentation',
      },
      servers: [
        {
          url: 'http://localhost:3000/api/v1',
        },
      ],
    },
    apis: ['./src/routes/*.js'], // Pfad zu den API-Dateien
  };
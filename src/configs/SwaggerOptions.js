// swaggerOptions.js
module.exports = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Express API mit Swagger',
        version: '1.0.0',
        description: 'Eine einfache Express API',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
    },
    apis: ['./src/routes/*.js'], // Pfad zu den API-Dateien
  };
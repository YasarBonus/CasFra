require('dotenv').config();

let mongooseUrl = '';

console.log('process.env.MODE_ENV', process.env.NODE_ENV)

if (process.env.NODE_ENV === 'development') {
  mongooseUrl = process.env.MONGOOSE_DEV_URL;
} else if (process.env.NODE_ENV === 'production') {
  mongooseUrl = process.env.MONGOOSE_PROD_URL;
}

module.exports = {
  url: mongooseUrl,
  options: {
    // Hier können Sie zusätzliche Optionen hinzufügen, wenn benötigt
  },
};

// dbConfig.js

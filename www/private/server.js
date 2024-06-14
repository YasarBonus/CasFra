const express = require('express');
const app = express();
const port = 3000;

// Statische Dateien aus dem "public"-Ordner bereitstellen
app.use(express.static('public'));
app.set('view engine', 'ejs')

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routen

const fs = require('fs');

const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database connection
const db = new sqlite3.Database('private/data/link_hits.db');

// Create a table to store link hits
db.run(`CREATE TABLE IF NOT EXISTS link_hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  date TEXT,
  time TEXT
)`);

app.get('/', (req, res) => {
  const user = {
    firstName: 'Tim',
    lastName: 'Cook',
  };
  res.render('pages/index', {
      user: user
  })
});

app.get('/faq', (req, res) => {
  const user = {
    firstName: 'Tim',
    lastName: 'Cook',
  };
  res.render('pages/faq', {
      user: user
  })
});

const ejs = require('ejs');


// Close the database connection when the server is shut down
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  });
});

// 301 Redirect
app.get('/casinos', (req, res) => {
  res.redirect(301, '/');
});

// 404 Error
app.use((req, res) => {
  res.status(404).send('404 - Page not found');
});

// 500 Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('500 - Internal Server Error');
});

// Server starten

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});


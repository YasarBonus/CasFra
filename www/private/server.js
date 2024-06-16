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

const i18n = require('i18n');

i18n.configure({
  locales:['en', 'de'],
  directory: __dirname + '/locales'
});

app.use(i18n.init);

console.log(i18n.__('Hello'));

app.get('/', (req, res) => {
  const user = {
    firstName: 'Tim',
    lastName: 'Cook',
  };
  res.render('pages/index', {
      user: user,
      i18n: res
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

// function to
// fetch available shortlinks from the API at https://api.yasarbonus.com/api/shortlinks?populate=*&pagination[pageSize]=1000&filters[Slug][$eq][0]= and save them in a variable


// shortlinks path at /go/:slug
app.get('/go/:slug', (req, res) => {
  const slug = req.params.slug;

  // fetch the shortlink from the API
  fetch(`https://api.yasarbonus.com/api/shortlinks?populate=*&filters[Slug][$eq][0]=${slug}`)
    .then(response => response.json())
    .then(data => {
      // check if the shortlink exists
      if (data.data.length > 0) {
        // redirect to the shortlink URL
        res.redirect(302, data.data[0].attributes.Target);
        // and save the hit in the database
        db.run('INSERT INTO link_hits (name, date, time) VALUES (?, ?, ?)', [slug, new Date().toLocaleDateString(), new Date().toLocaleTimeString()]);
      } else {
        // check if there is a casino with the slug
        fetch(`https://api.yasarbonus.com/api/casinos?fields[0]=Slug&pagination[pageSize]=500&fields[1]=affiliateUrl`)
          .then(response => response.json())
          .then(data => {
            console.log("Api Response:" + data.data);
            // check if the casino exists with the slug by filtering the data
            const casino = data.data.find(casino => casino.attributes.Slug === slug);
            
            console.log("Got casino: " + casino);
            if (casino) {
              // if the casino exists, redirect to the casino affiliateUrl
              res.redirect(302, casino.attributes.affiliateUrl);
              // and save the hit in the database
              db.run('INSERT INTO link_hits (name, date, time) VALUES (?, ?, ?)', [slug, new Date().toLocaleDateString(), new Date().toLocaleTimeString()]);              
            } else {
              // if the shortlink and casino do not exist, return a 404 error
              res.status(404).send('404 - Page not found');
            }
            
          })
          .catch(error => {
            console.error(error);
            // return a 500 error if there was an error fetching the casino
            res.status(500).send('500 - Internal Server Error');
          });

      }
    })
    .catch(error => {
      console.error(error);
      // return a 500 error if there was an error fetching the shortlink
      res.status(500).send('500 - Internal Server Error');
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

// Server starten

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});


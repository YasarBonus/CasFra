const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Statische Dateien aus dem "public"-Ordner bereitstellen
app.use(express.static('public'));
app.set('view engine', 'ejs')


const TelegramBot = require('node-telegram-bot-api');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const botToken = '6546958683:AAEypJoQoWEDta6xESHcRIBpMscRTY2-r1Y';
const chatId = '-933586473';

// Create a new instance of the Telegram Bot
const bot = new TelegramBot(botToken, { polling: true });

// Function to send a message to the Telegram channel
function sendTelegram(message) {
  bot.sendMessage(chatId, message)
    .then(() => {
      console.log('Message sent successfully');
    })
    .catch((error) => {
      console.error('Error sending message:', error);
    });
};

// Routen

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'haa1NeeJ4aijiabee3PheTiethu6yaihahDiewoophooneipeePaeJee2aey',
    resave: false,
    saveUninitialized: false
}));

const db = mysql.createConnection({
    host: 'cax.treudler.net',
    user: 'casfra_admin',
    password: 'jienohnoikoh0ir7xaeji2aathaeNiegaiCaizaetheeleewu9eiph0jieVe',
    database: 'casfra_admin'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');

    // Create table if it does not exist
    const createRegistrationKeyTableQuery = `CREATE TABLE IF NOT EXISTS registration_keys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      regkey VARCHAR(255) NOT NULL
  )`;

  db.query(createRegistrationKeyTableQuery, (err, result) => {
      if (err) throw err;
      console.log('Registration Key table created or already exists');
  });

    // Create table if it does not exist
    const createTableQuery = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
    )`;

    db.query(createTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Users table created or already exists');
    });

    // Insert initial data if table is empty
    const checkDataQuery = `SELECT COUNT(*) AS count FROM users`;
    db.query(checkDataQuery, (err, result) => {
        if (err) throw err;
        const count = result[0].count;
        if (count === 0) {
            const username = 'admin';
            const password = 'admin123';
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) throw err;
                const insertDataQuery = `INSERT INTO users (username, password) VALUES (?, ?)`;
                db.query(insertDataQuery, [username, hash], (err, result) => {
                    if (err) throw err;
                    console.log('Initial data inserted');
                });
            });
        }
    });

    // Create dashboard table if it does not exist
    const createDashboardTableQuery = `CREATE TABLE IF NOT EXISTS data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL
    )`;

    db.query(createDashboardTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Dashboard table created or already exists');
    });

    // Insert initial data for dashboard if table is empty
    const checkDashboardDataQuery = `SELECT COUNT(*) AS count FROM data`;
    db.query(checkDashboardDataQuery, (err, result) => {
        if (err) throw err;
        const count = result[0].count;
        if (count === 0) {
            const title = 'Welcome';
            const content = 'This is the dashboard content.';
            const insertDashboardDataQuery = `INSERT INTO data (title, content) VALUES (?, ?)`;
            db.query(insertDashboardDataQuery, [title, content], (err, result) => {
                if (err) throw err;
                console.log('Initial dashboard data inserted');
            });
        }
    });

        // Create faq table if it does not exist
        const createFaqTableQuery = `CREATE TABLE IF NOT EXISTS faq (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL
      )`;
  
      db.query(createFaqTableQuery, (err, result) => {
          if (err) throw err;
          console.log('FAQ table created or already exists');
      });

    
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            bcrypt.compare(password, result[0].password, (err, response) => {
                if (response) {
                    req.session.user = result;
                    res.redirect('/dashboard');
                } else {
                    res.send('Incorrect username and/or password!');
                }
            });
        } else {
            res.send('Incorrect username and/or password!');
        }
    });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const registrationKey = req.body.registrationKey;

  db.query('SELECT * FROM registration_keys WHERE regkey = ?', [registrationKey], (err, results) => {
      if (err) throw err;

      if (results.length === 0) {
          res.status(400).send('Ungültiger Registrierungsschlüssel');
          return;
      }

      bcrypt.hash(password, 10, (err, hash) => {
          if (err) throw err;

          db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err, result) => {
              if (err) throw err;

              db.query('DELETE FROM registration_keys WHERE regkey = ?', [registrationKey], (err, result) => {
                  if (err) throw err;

                  res.redirect('/login');
              });
          });
      });
  });
});

// Middleware to check if the user is logged in
function checkLoggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Dashboard route
app.get('/dashboard', checkLoggedIn, (req, res) => {
  res.render('dashboard');
});

app.get('/get-data', checkLoggedIn, (req, res) => {
    db.query('SELECT * FROM data', (err, results) => {
        if (err) throw err;

        res.json(results);
    });
});

app.get('/add-data', (req, res) => {
    res.sendFile(__dirname + '/add-data.html');
});

app.post('/add-data', (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    console.log (title, content);

    const bodyParser = require('body-parser');
    app.use(bodyParser.json());

    db.query('INSERT INTO data (title, content) VALUES (?, ?)', [title, content], (err, result) => {
        if (err) throw err;

        res.redirect('/dashboard');
    });
});

app.post('/delete-data', checkLoggedIn, (req, res) => {
    const id = req.body.id;

    db.query('DELETE FROM data WHERE id = ?', [id], (err, result) => {
        if (err) throw err;

        res.json({ success: true });
    });
});

app.post('/update-data', checkLoggedIn, (req, res) => {
    const id = req.body.id;
    const title = req.body.title;
    const content = req.body.content;

    db.query('UPDATE data SET title = ?, content = ? WHERE id = ?', [title, content, id], (err, result) => {
        if (err) throw err;

        res.json({ success: true });
    });
});

const fs = require('fs');

app.post('/save-data', checkLoggedIn, (req, res) => {
    db.query('SELECT * FROM data', (err, results) => {
        if (err) throw err;

        fs.writeFile('data.json', JSON.stringify(results), (err) => {
            if (err) throw err;

            res.json({ success: true });
        });
    });
});

app.post('/load-data', checkLoggedIn, (req, res) => {
    // ...
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) throw err;

        const jsonData = JSON.parse(data);

        // Get all existing IDs from the database
        db.query('SELECT id FROM data', (err, results) => {
            if (err) throw err;

            const existingIDs = results.map(result => result.id);

            // Iterate through each item in the JSON data
            jsonData.forEach(item => {
                if (existingIDs.includes(item.id)) {
                    // Entry with the same ID already exists, update it
                    db.query('UPDATE data SET title = ?, content = ? WHERE id = ?', [item.title, item.content, item.id], (err, result) => {
                        if (err) throw err;
                    });
                } else {
                    // Entry with the same ID doesn't exist, insert it
                    db.query('INSERT INTO data (id, title, content) VALUES (?, ?, ?)', [item.id, item.title, item.content], (err, result) => {
                        if (err) throw err;
                    });
                }
            });

            // Delete entries with IDs not present in the JSON data
            const jsonIDs = jsonData.map(item => item.id);
            const deleteIDs = existingIDs.filter(id => !jsonIDs.includes(id));

            if (deleteIDs.length > 0) {
                db.query('DELETE FROM data WHERE id IN (?)', [deleteIDs], (err, result) => {
                    if (err) throw err;
                });
            }

            res.json({ success: true });
        });
    });
});

app.get('/load-json-data', (req, res) => {
  const path = require('path');
  fs.readFile(path.join(__dirname, 'data/casinos.json'), 'utf8', (err, data) => {
      if (err) {
          console.error(err);
          res.status(500).send('Server error');
          return;
      }

      const jsonData = JSON.parse(data);

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
          res.status(400).send('Invalid JSON data');
          return;
      }

      const createTableQuery = `CREATE TABLE IF NOT EXISTS json_data (id INT AUTO_INCREMENT PRIMARY KEY)`;

      db.query(createTableQuery, (err, result) => {
          if (err) throw err;

          const addColumnQuery = `ALTER TABLE json_data ADD COLUMN IF NOT EXISTS data TEXT`;

          db.query(addColumnQuery, (err, result) => {
              if (err) throw err;

              jsonData.forEach(item => {
                  const insertQuery = `INSERT INTO json_data (data) VALUES (?)`;
                  db.query(insertQuery, [JSON.stringify(item)], (err, result) => {
                      if (err) throw err;
                  });
              });

              res.json({ success: true });
          });
      });
  });
});


app.get('/get-table-names', checkLoggedIn, (req, res) => {
    db.query("SHOW TABLES LIKE 'bk_%'", (err, results) => {
        if (err) throw err;

        // Extract table names from the results
        const tableNames = results.map(row => Object.values(row)[0]);

        res.json(tableNames);
    });
});

app.post('/restore-table', checkLoggedIn, (req, res) => {
    const tableName = req.body.table;

    // Drop the existing 'data' table
    db.query('DROP TABLE IF EXISTS data', (err, result) => {
        if (err) throw err;

        // Create a new 'data' table and fill it with the data from the selected table
        db.query(`CREATE TABLE data AS SELECT * FROM ${tableName}`, (err, result) => {
            if (err) throw err;

            res.json({ success: true });
        });
    });
});

app.post('/delete-table', checkLoggedIn, (req, res) => {
    const tableName = req.body.table;

    // Drop the selected table
    db.query(`DROP TABLE ${tableName}`, (err, result) => {
        if (err) throw err;

        res.json({ success: true });
    });
});

app.post('/show-table-data', checkLoggedIn, (req, res) => {
  const tableName = req.body.table;

  // Check if the table name starts with 'bk_data_'
  if (!tableName.startsWith('bk_data_')) {
      return res.status(400).json({ error: 'Ungültiger Tabellenname' });
  }

  // Query the database to get all data from the specified table
  db.query(`SELECT * FROM ${tableName}`, (err, result) => {
      if (err) throw err;

      // Send the data as a response
      res.json(result);
  });
});

app.post('/create-backup', checkLoggedIn, (req, res) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0');
    const backupTableName = `bk_data_${year}${month}${day}T${hours}${minutes}${seconds}${milliseconds}Z`;

    // Create a new table and fill it with the data from the 'data' table
    db.query(`CREATE TABLE ${backupTableName} AS SELECT * FROM data`, (err, result) => {
        if (err) throw err;

        res.json({ success: true });
    });
});


app.get('/api', (req, res) => {
  // Hier kannst du deinen serverseitigen Code einfügen
  res.send('Hello World!');
});

const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database connection
const dbLinkHits = new sqlite3.Database('private/data/link_hits.db');

// Create a table to store link hits
dbLinkHits.run(`CREATE TABLE IF NOT EXISTS link_hits (
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

app.get('/admin', (req, res) => {
  const user = {
    firstName: 'Tim',
    lastName: 'Cook',
  };
  res.render('pages/admin', {
      user: user
  })
});

app.get('/twitch-store', (req, res) => {
  const user = {
    firstName: 'Tim',
    lastName: 'Cook',
  };
  res.render('pages/twitch-store', {
      user: user
  })
});

const ejs = require('ejs');

app.get('/casino/:name', (req, res) => {
  const name = req.params.name.toLowerCase();
  fs.readFile('private/data/casinos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading casinos.json');
    } else {
      const casinos = JSON.parse(data);
      const casino = casinos.find(casino => casino.name.toLowerCase() === name);
      if (casino) {
        fs.readFile(`pages/casinotemplate`, 'utf8', (err, templateData) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error reading template file');
          } else {
            const processedHtml = ejs.render(templateData, { casino });
            res.send(processedHtml);
          }
        });
      } else {
        res.status(404).send('Casino not found');
      }
    }
  });
});

app.get('/api/faq', (req, res) => {
  fs.readFile('private/data/faq.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading faq.json');
    } else {
      res.send(data);
    }
  });
});

// Rest of the code...

// const fs = require('fs');
app.get('/api/casinos/htmldiv', (req, res) => {
  fs.readFile('private/data/casinos.json', 'utf8', (err, data) => {
    // Error handling
    if (err) {
      console.error(err);
      res.status(500).send('Error reading JSON file');
      return;
    }
    try {
      // Parse JSON data and send it to the client
      const jsonData = JSON.parse(data);

      

      // Apply filter based on URL parameters
      const { minbonus, name, vpn, sticky, category, nomaxcashout, bonushunt, sportbets, nodeposit, prohibitedgamesprotection, provider, paymentmethod, company, egonsbest} = req.query;
      const date = new Date().toLocaleDateString(); const time = new Date().toLocaleTimeString();
      console.log(req.query, date, "-", time);

      // Filter data based on URL parameters (if they exist)
      let prefilteredData = jsonData;
      prefilteredData = prefilteredData.filter(casino => casino.hidden !== 'true');

      let filteredData = prefilteredData.sort((a, b) => parseFloat(a.sorting) - parseFloat(b.sorting));

      if (name) {
        filteredData = filteredData.filter(casino => casino.name.toLowerCase().includes(name.toLowerCase()));
      }

      if (sticky) {
        if (sticky === 'sticky') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'true');
        } else if (sticky === 'nonsticky') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'false');
        } else if (sticky === 'wagerfree') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'wagerfree');
        }
      }

      if (category) {
        if (category === 'wagerfree') {
          filteredData = filteredData.filter(casino => casino.wager === '0x');
        } else if (category === 'sticky') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'true');
        } else if (category === 'nonsticky') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'false');
        }
      }

      if (sportbets) {
        if (sportbets === 'true') {
          filteredData = filteredData.filter(casino => casino.sportbets === 'true');
        } else if (sportbets === '') {
          filteredData = filteredData.filter(casino => casino.sportbets === 'false');
        }
      }

      if (nomaxcashout) {
        if (nomaxcashout === 'true') {
          filteredData = filteredData.filter(casino => casino.max_cashout === 'No');
        } else if (bonushunt === 'false') {
          filteredData = filteredData.filter(casino => !casino.max_cashout === 'No');
        }
      }

      if (bonushunt) {
        if (bonushunt === 'true') {
          filteredData = filteredData.filter(casino => casino.bonushunt === 'true');
        } else if (bonushunt === 'false') {
          filteredData = filteredData.filter(casino => !casino.bonushunt === 'true');
        }
      }

      if (nodeposit) {
        if (nodeposit === 'true') {
          filteredData = filteredData.filter(casino => casino.nodeposit === 'true');
        } else if (nodeposit === 'false') {
          filteredData = filteredData.filter(casino => casino.nodeposit === 'false');
        }
      }

      if (vpn) {
        if (vpn === 'true') {
          filteredData = filteredData.filter(casino => casino.vpn === 'true');
        } else if (vpn === 'false') {
          filteredData = filteredData.filter(casino => casino.vpn === 'false');
        }
      }

      if (prohibitedgamesprotection) {
        if (prohibitedgamesprotection === 'true') {
          filteredData = filteredData.filter(casino => casino.prohibitedgamesprotection === 'true');
        } else if (prohibitedgamesprotection === 'false') {
          filteredData = filteredData.filter(casino => !casino.prohibitedgamesprotection === 'true');
        }
      }

      if (egonsbest) {
        if (egonsbest === 'true') {
          filteredData = filteredData.filter(casino => casino.egons_best === 'true');
        } else if (egonsbest === 'false') {
          filteredData = filteredData.filter(casino => !casino.egons_best === 'true');
        }
      }

      if (provider) {
        const providersArray = provider.split(',');
        console.log(providersArray);
        filteredData = filteredData.filter(casino => providersArray.every(provider => casino.providers.includes(provider)));
      }

      if (paymentmethod) {
        const paymentmethodArray = paymentmethod.split(',');
        console.log(paymentmethodArray);
        filteredData = filteredData.filter(casino => paymentmethodArray.every(paymentmethod => casino.paymentmethods.includes(paymentmethod)));
      }

      if (company) {
        if (company === 'n1') {
          filteredData = filteredData.filter(casino => casino.company === 'n1');
        } else if (company === 'dama') {
          filteredData = filteredData.filter(casino => casino.company === 'dama');
        } else if (company === 'hollycorn') {
          filteredData = filteredData.filter(casino => casino.company === 'hollycorn');
        } else if (company === 'rabidi') {
          filteredData = filteredData.filter(casino => casino.company === 'rabidi');
        } 
      }

      if (minbonus) {
        filteredData = filteredData.filter(casino => parseInt(casino.bonus_display) >= parseInt(minbonus));
      }
      
      if (company) {
        filteredData = filteredData.filter(casino => casino.company.toLowerCase().includes(company.toLowerCase()));
      }
      // END: abpxx6d04wxr

      console.log('Filtered Casinos: ', filteredData.length, 'of', jsonData.length);
      // var casino = filteredData;
      // var lowercaseName = filteredData.name.toLowerCase();
      // console.log(filteredData);
      // console.log(casino[0].name);
      var html = ``;

      if (filteredData.length === 0) {
        html += `
        <div class="ui icon message">
  <i class="user secret icon"></i>
  <div class="content">
    <div class="header">
      No Casinos found
    </div>
    <p>Please try some other search term.</p>
  </div>
  <div class="filteritem" onclick="resetFilters()">
    <div class="center aligned medium orange ui button">Reset Filter</div>
  </div>
</div>
        `;
      } else {
        filteredData.forEach(casino => {
      
       var lowercaseName = casino.name.toLowerCase();
      html += `
      <div class="top attached ui segment" id="casino${lowercaseName}" style="background-color: beige;">
                <div class="ui styled six column grid" style="">
                  <div class="ui four wide column">
                  ${casino.label ? `<div class="ui teal large ribbon label">${casino.label}</div>` : ''}
                  </div>
                  <div class="ui three wide left aligned column">
                  ${casino.egons_best == "true" ? `<div class="ui small orange image label"><img src="/img/avatar/egon.png"> Egon's Best</div>` : ``}
                  ${casino.company == "dama" ? `<div class="ui small orange image label">Dama NV</div>` : casino.company == "rabidi" ? `<div class="ui small orange image label">Rabidi NV</div>` : casino.company == "n1" ? `<div class="ui small orange image label">N1 Interactive</div>` : casino.company == "hollycorn" ? `<div class="ui small orange image label">Hollycorn NV</div>` : ``}

                  ${casino.code ? `
                  
                  <!-- div class="ui small input">
                          <input class="" type="text" value="${casino.code}"></input>
                          <button type="button"  onclick="copyText('${casino.code}')"  name="copyToken" value="copy" class="copyToken ui right icon button">
                              <i class="clipboard icon"></i>
                          </button>
                  </div -->
                  
                  ` : ``}
                  </div>
                  <div class="ui nine wide right aligned column" style="padding-right:10px;">
                  ${casino.tags ? casino.tags.map(tag => `<div class="ui mini olive tag label">${tag}</div>`).join('    ') : ''}
                  ${casino.prohibitedgamesprotection == "true" ? `<a data-tooltip="Prohibited Games Protection" onclick="setCheckboxAndFetchData(prohibitedgamesprotectionFilter, true)" class="ui right floated small blue circular label"><i class="lock icon"></i> PGP</a>` : casino.prohibitedgamesprotection == "false" ? `<a data-tooltip="No Prohibited Games Protection" onclick="setCheckboxAndFetchData(prohibitedgamesprotectionFilter, true)" class="ui right floated small red circular label"><i class="lock open icon"></i> PGP</a>` : ``}
                  ${casino.nodeposit == "true" ? `<a data-tooltip="No Deposit Bonus - Cool!" onclick="setCheckboxAndFetchData(nodepositFilter, true)" class="right floated small blue circular ui label"><i class="plus icon"></i> Nodeposit</a>` : ``}
                  ${casino.sportbets == "true" ? `<a data-tooltip="Sportbets available" onclick="setCheckboxAndFetchData(sportbetsFilter, true)" class="ui right floated small blue circular label"><i class="plus icon"></i> Sportbets</a>` : ``}
                  ${casino.bonus_display_sticky == "true" ? `<a data-tooltip="Sticky Bonus" onclick="setCheckboxAndFetchData(nonstickyFilter, true)" class="ui right floated small purple circular label">Sticky</a>` : casino.bonus_display_sticky == "false" ? `<a data-tooltip="Non-Sticky Bonus" onclick="setCheckboxAndFetchData(nonstickyFilter, true)" class="ui right floated small purple circular label">Non-Sticky</a>` : casino.bonus_display_sticky == "wagerfree" ? `<a data-tooltip="Wagerfree Bonus" onclick="setCheckboxAndFetchData(wagerfreeFilter, true)" class="ui right floated small purple circular label">Wagerfree</a>` : ``}
                  ${casino.bonushunt == "true" ? `<a data-tooltip="Bonushunt is allowed" onclick="setCheckboxAndFetchData(bonushuntFilter, true)" class="ui right floated small green circular label"><i class="check icon"></i> Bonushunt</a>` : `<a data-tooltip="Bonushunt is not allowed" onclick="setCheckboxAndFetchData(bonushuntFilter, true)" class="ui right small floated red circular label"><i class="x icon"></i> Bonushunt</a>`}
                  ${casino.vpn == "true" ? `<a data-tooltip="VPN is allowed" onclick="setCheckboxAndFetchData(vpnFilter, true)" class="ui right floated small green circular label"><i class="check icon"></i> VPN</a>` : ` <a data-tooltip="VPN is allowed" onclick="setCheckboxAndFetchData(vpnFilter, true)" class="ui right small floated red circular label"><i class="x icon"></i> VPN</a>`}
                  </div>
                  <!-- div class="ui one wide column">
                  ${casino.label ? `<div class="ui orange right corner label"><i class="heart icon"></i></div>` : ''}
                  </div -->
                </div>
                <div class="ui styled three column grid " style=""> 
                    <div class="ui three wide column" style="padding-left:15px">
                        <img style="width:160px;" src="img/casinos/${lowercaseName}.png" alt="${lowercaseName} ">
                    </div>
                    <div class="ui ten wide center aligned column">
                        <div class="ui center aligned four column grid"> 
                            <div class="row" style="padding-top:20px"> 
                                <div class="four wide computer eight wide mobile column">
                                    <div class="bonustext">${casino.bonus_display} %</div>
                                    <div style="font-size:18px; padding-top:15px;">up to ${casino.bonus_display_max} €</div>
                                    <div class="bonushead">Bonus</div>
                                </div>
                                <div class="three wide computer eight wide mobile column">
                                    <div class="bonustext">${casino.max_bet} €</div>
                                    <div class="bonushead">Max Bet</div>
                                    
                                </div>
                                <div class="three wide computer eight wide mobile column">
                                    <div class="bonustext">${casino.max_cashout}</div>
                                    <div class="bonushead">Max Cashout</div>
                                </div>
                                  <div class="five wide computer eight wide mobile column">
                                  <div class="bonustext">${casino.wager} (${casino.wager_type})</div>
                                  <div class="bonushead">Wager</div>
                                    </div>
                            </div> 
                        </div> 
                    </div>
                    <div class="ui three wide right aligned column">
                        <div class="ui right floated" style="padding-right:15px">
                            <a href="/go/${casino.name}" target="_blank" class="ui large green button">
                                PLAY NOW
                                <!-- i class="right chevron icon"></i -->
                            </a>
                              <div class="attached">
                                <div style="text-align: center;">T&C apply</div>
                              </div>
                        </div>
                    </div>
                    </div>
                    <div id="div${lowercaseName}details" style="display:none;">
                    <div class="attached ui segment" style="border:0px; background-color: beige;">
                    <div class="ui styled four column grid">
                        <div class="eight wide column">
                          <h3>Casino Bonus</h3>
                          <ul class="ui list">
                          ${casino.boni ? casino.boni.map(bonus => `<div class="item">${bonus}</div>`).join('') : ''}
                          </ul>
                          ${casino.review_small ? `
                          <div class="ui comments">
  <div class="short comment">
    <a class="avatar">
      <img src="/img/avatar/egon.png">
    </a>
    <div class="content">
      <div class="author">Egon's Review</div>
      <!-- div class="metadata">
        <div class="date">2 days ago</div>
        <div class="rating">
          <i class="star icon"></i>
          5 Faves
        </div>
      </div -->
      <div class="text">
      ${casino.review_small}
      </div>
    </div>
  </div>
</div>` : ''}
                        </div>
                        
                        <div class="eight wide column">
                          <h3>Casino Features</h3>
                          <ul class="ui list">
                            ${casino.features ? casino.features.map(feature => `<div class="item">${feature}</div>`).join('') : ''}
                          </ul>
                        </div> 
                        <div class="eight wide column">
                          <h3>Provider</h3>
                          <div class="ui five column grid container">
                          ${casino.providers ? casino.providers.map(provider => `<div class="column"><img style="max-width:60px;" src="img/provider/${provider}.png" alt="${provider}" /></div>`).join('') : ''}
                          </div>                    
                        </div> 
                        <div class="eight wide column">
                          <h3>Payment Methods</h3>

                          <div class="ui five column grid container">
                          ${casino.paymentmethods ? casino.paymentmethods.map(paymentMethod => `<div class="column"><img style="max-width:60px;" src="img/paymentmethods/${paymentMethod}.png" alt="${paymentMethod}" /></div>`).join('') : ''}
                          </div>
                        </div> 
                        </div>
                        </div>
                </div>
                

            </div>
            <div class="bottom attached ui button" id="toggleBtn${lowercaseName}">
            Details
      </div>
      <script>
      document.getElementById("toggleBtn${lowercaseName}").onclick = function() {
          var div${lowercaseName}details = document.getElementById("div${lowercaseName}details");
          if (div${lowercaseName}details.style.display === "none") {
            div${lowercaseName}details.style.display = "block";
          } else {
            div${lowercaseName}details.style.display = "none";
          }
      };
  </script>
      `;
      })};
      res.send(html)
      
    } catch (error) {
      console.error(error);
      res.status(500).send('Error parsing JSON data');
    }
    

  
  });
});

// Read data from casinos.json using fs.readFile
app.get('/api/casinos', (req, res) => {
  fs.readFile('private/data/casinos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading casinos.json');
    } else {
      res.send(data);
    }
  });
});

app.get('/:link', (req, res) => {
  const linkName = req.params.link;
  
  fs.readFile('private/data/links.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading JSON file');
      return;
    }
    
    try {
      const jsonData = JSON.parse(data);
      const link = jsonData.find(link => link.name.toLowerCase() === linkName.toLowerCase());
      console.log(link);
      
      if (link) {
        // Insert link hit into the database
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        const name = link.name.toLowerCase();
        db.run(`INSERT INTO link_hits (name, date, time) VALUES (?, ?, ?)`, [name, currentDate, currentTime], (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error inserting link hit into the database');
          } else {
            res.redirect(link.url);
            
          }
        });
      } else {
        res.status(404).send('Link not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error parsing JSON data');
    }
  });
});

app.get('/go/:casino', (req, res) => {
  const casinoName = req.params.casino;
  
  fs.readFile('private/data/casinos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading JSON file');
      return;
    }
    
    try {
      const jsonData = JSON.parse(data);
      const casino = jsonData.find(casino => casino.name.toLowerCase() === casinoName.toLowerCase());
      console.log(casino);
      
      if (casino) {
        // Insert link hit into the database
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        // transform to lowercase before inserting into database
        const name = casino.name.toLowerCase();
        // const name = casino.name.toLowerCase();
        db.run(`INSERT INTO link_hits (name, date, time) VALUES (?, ?, ?)`, [name, currentDate, currentTime], (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error inserting link hit into the database');
          } else {
            res.redirect(casino.url);
          }
        });
      } else {
        res.status(404).send('Casino not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error parsing JSON data');
    }
  });
});

app.get('/api/link-hits', (req, res) => {
  dbLinkHits.all('SELECT name, COUNT(*) AS hits FROM link_hits GROUP BY name', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving link hits from the database');
    } else {
      res.json(rows);
    }
  });
});


// Close the database connection when the server is shut down
process.on('SIGINT', () => {
  dbLinkHits.close((err) => {
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


const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const schedule = require('node-schedule');
const fs = require('fs');
const MySQLStore = require('connect-mysql')(session);
const multer = require('multer');
const path = require('path');
const ejs = require('ejs');

const sendPasswordResetEmail = require('./functions/emailService');


const app = express();
const port = 3001;

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


const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API mit Swagger',
      version: '1.0.0',
    },
  },
  // Pfad zu Ihrer API-Routen-Datei(en)
  apis: ['private/server.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

// Routen



app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const options = {
  config: {
      host: 'cax.treudler.net', // Der Host Ihrer Datenbank. Ändern Sie dies entsprechend.
      user: 'casfra_admin', // Der Benutzername Ihrer Datenbank. Ändern Sie dies entsprechend.
      password: 'jienohnoikoh0ir7xaeji2aathaeNiegaiCaizaetheeleewu9eiph0jieVe', // Das Passwort Ihrer Datenbank. Ändern Sie dies entsprechend.
      database: 'casfra_admin' // Der Name Ihrer Datenbank. Ändern Sie dies entsprechend.
  }
};

app.use(session({
  secret: 'haa1NeeJ4aijiabee3PheTiethu6yaihahDiewoophooneipeePaeJee2aey',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600 * 1000 }, // Setzt das Ablaufdatum auf 1 Stunde nach Erstellung
  store: new MySQLStore(options)
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

    // Create users table if it does not exist
    const createUsersTableQuery = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        language VARCHAR(255) NOT NULL,
        UNIQUE (username)
    )`;

    db.query(createUsersTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Users table created or already exists');
    });

    const createUserPersonalTableQuery = `CREATE TABLE IF NOT EXISTS user_personal (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      firstname VARCHAR(255) NOT NULL,
      middlename VARCHAR(255) NOT NULL,
      lastname VARCHAR(255) NOT NULL,
      nationality VARCHAR(255) NOT NULL,
      street VARCHAR(255) NOT NULL,
      housenumber VARCHAR(255) NOT NULL,
      zipcode VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      country VARCHAR(255) NOT NULL,
      phone VARCHAR(255) NOT NULL,
      mobile VARCHAR(255) NOT NULL,
      UNIQUE (mobile))`;

      db.query(createUserPersonalTableQuery, (err, result) => {
        if (err) throw err;
        console.log('User Personal table created or already exists');
    });

    const createUserShippingTableQuery = `CREATE TABLE IF NOT EXISTS user_shipping (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      firstname VARCHAR(255) NOT NULL,
      middlename VARCHAR(255) NOT NULL,
      lastname VARCHAR(255) NOT NULL,
      street VARCHAR(255) NOT NULL,
      housenumber VARCHAR(255) NOT NULL,
      addition VARCHAR(255) NOT NULL,
      zipcode VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      country VARCHAR(255) NOT NULL,
      phone VARCHAR(255) NOT NULL,
      mobile VARCHAR(255) NOT NULL,
      UNIQUE (mobile))`;

      db.query(createUserShippingTableQuery, (err, result) => {
        if (err) throw err;
        console.log('User Shipping table created or already exists');
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

// Create the permission_groups table if it does not exist
const createPermissionGroupsTableQuery = `CREATE TABLE IF NOT EXISTS user_group_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  permissions VARCHAR(255)
)`;

db.query(createPermissionGroupsTableQuery, (err, result) => {
  if (err) throw err;
  console.log('Permission Groups table created or already exists');
});

      // Create the user_groups table if it does not exist
      const createUserGroupsTableQuery = `CREATE TABLE IF NOT EXISTS user_group_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        group_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (group_id) REFERENCES user_group_permissions(id)
    )`;
    
    db.query(createUserGroupsTableQuery, (err, result) => {
        if (err) throw err;
        console.log('User Groups table created or already exists');
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

    // Create the link hits table if it does not exist
    const createLinkHitsTableQuery = `CREATE TABLE IF NOT EXISTS link_hits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )`;

    db.query(createLinkHitsTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Link hits table created or already exists');
    });

    // create the link hits combined table if it does not exist
    const createLinkHitsCombinedTableQuery = `CREATE TABLE IF NOT EXISTS link_hits_count (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name TEXT NOT NULL,
        count INT NOT NULL
    )`;

    db.query(createLinkHitsCombinedTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Link hits combined table created or already exists');
    });


    // Create casinos table if it does not exist
    const createCasinosTableQuery = `CREATE TABLE IF NOT EXISTS casinos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        json_data MEDIUMTEXT NOT NULL
    )`;

    db.query(createCasinosTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Casinos table created or already exists');
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
          question VARCHAR(255) NOT NULL,
          answer TEXT NOT NULL,
          sortingorder INT NOT NULL
      )`;
  
      db.query(createFaqTableQuery, (err, result) => {
          if (err) throw err;
          console.log('FAQ table created or already exists');
      });

    
});

function updateLinkHitsCount() {
// SQL-Abfrage, um alle Einträge aus der link_hits_count Tabelle zu löschen
const deleteQuery = `DELETE FROM link_hits_count`;

db.query(deleteQuery, (err, results) => {
  if (err) throw err;

  console.log('Deleted all entries from link_hits_count');

  // SQL-Abfrage, um den Zähler für die ID zurückzusetzen
  const resetIdQuery = `ALTER TABLE link_hits_count AUTO_INCREMENT = 1`;

  db.query(resetIdQuery, (err, results) => {
    if (err) throw err;

    console.log('Reset ID counter in link_hits_count');

    // SQL-Abfrage, um die Einträge für jeden Namen zu zählen
    const insertQuery = `
      INSERT INTO link_hits_count (name, count)
      SELECT name, COUNT(*)
      FROM link_hits
      GROUP BY name
    `;

    db.query(insertQuery, (err, results) => {
      if (err) throw err;

      console.log('Updated link_hits_count');
    });
  });
})};

setInterval(() => {
  updateLinkHitsCount();
}, 60000); // 10000 Millisekunden = 10 Sekunden

app.post('/api/user/:userId/group/:groupId', checkLoggedIn, checkPermissions('manageUsers'), (req, res) => {
  const { userId, groupId } = req.params;

  const query = 'INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)';
  db.query(query, [userId, groupId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
    } else {
      res.send('User added to group');
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (err, response) => {
        if (err) {
          console.error(err);
          res.status(500).send('Server error');
          return;
        }

        if (response) {
          req.session.user = {
            id: result[0].id,
            username: result[0].username,
            email: result[0].email,
            permissions: [] // Initialize permissions array
          };

          // Get user permissions
          db.query('SELECT GROUP_CONCAT(permissions) AS permissions FROM user_group_permissions WHERE id IN (SELECT group_id FROM user_group_assignments WHERE user_id = ?)', [result[0].id], (err, permissionResults) => {
            if (err) {
              console.error(err);
              res.status(500).send('Server error');
              return;
            }

            req.session.user.permissions = permissionResults[0].permissions.split(',');
            console.log('Logged in', req.session.user);
            res.redirect('/dashboard');
          });
          
        } else {
          res.send('Incorrect username and/or password!');
        }
      });
    } else {
      res.send('Incorrect username and/or password!');
    }
  });
});

// Route, um die Sitzungsdaten abzurufen
app.get('/api/sessions', checkPermissions('superAdmin'),(req, res) => {
  const query = 'SELECT * FROM sessions';

  db.query(query, (err, rows) => {
    if (err) throw err;

    res.json(rows);
  });
});

// Route, um die Sitzung zu beenden
app.post('/api/sessions/end', checkPermissions('superAdmin'),(req, res) => {
  const sessionId = req.body.sessionId;
  const query = 'DELETE FROM sessions WHERE sid = ?';

  db.query(query, [sessionId], (err) => {
    if (err) throw err;

    res.json({ success: true });
  });
});

app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;

    res.json(results);
  });
});

app.get('/api/auth/user/:userID/groups', checkPermissions('manageUsers'), (req, res) => {
  const userID = req.params.userID;

  db.query('SELECT * FROM user_group_assignments WHERE user_id = ?', [userID], (err, results) => {
    if (err) throw err;

    res.json(results);
  });
});

app.get('/api/user/:userID/groups/available', checkPermissions('manageUsers'), (req, res) => {
  const userID = req.params.userID;

  db.query('SELECT * FROM user_group_permissions WHERE id NOT IN (SELECT group_id FROM user_group_assignments WHERE user_id = ?)', [userID], (err, results) => {
    if (err) throw err;

    res.json(results);
  });
});

app.post('/api/user/:userID/groups/add', checkPermissions('manageUsers'), (req, res) => {
  const userID = req.params.userID;
  const groupID = req.body.groupID;

  db.query('INSERT INTO user_group_assignments (user_id, group_id) VALUES (?, ?)', [userID, groupID], (err, result) => {
    if (err) throw err;

    res.redirect('/dashboard');
  });
});

app.get('/api/user', checkPermissions('manageAccount'), (req, res) => {
  const user = req.session.user;
  res.json(user);
  console.log('Session User Data:', req.session.user);
});

app.get('/api/user/personal', checkPermissions('manageAccount'), (req, res) => {
  const userId = req.session.user.id;
  db.query('SELECT * FROM user_personal WHERE user_id = ?', [userId], (err, results) => {
    if (err) throw err;

    const data = results[0]; // Get the first result from the array

    res.json(data);
  });
});

app.use(express.urlencoded({ extended: true })); // Middleware zum Parsen von URL-kodierten Formulardaten

app.post('/api/user/edit', (req, res) => {
  const userId = req.session.user.id;
  const userName = req.body.userName;
  const userEmail = req.body.userEmail;
  // const userLanguage = req.body.userLanguage;
  const userLanguage = 'en';

  const userQuery = 'UPDATE users SET username = ?, email = ?, language = ? WHERE id = ?';
  db.query(userQuery, [userName, userEmail, userLanguage, userId], (error) => {
    if (error) throw error;

    // Update session information with new values
    req.session.user.username = userName;
    req.session.user.email = userEmail;
    req.session.user.language = userLanguage;

    res.json({ success: true });
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

app.post('/api/user/delete', checkPermissions('manageAccount'), (req, res) => {
  const userId = req.body.userId;

  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
      if (err) throw err;

      res.redirect('/dashboard');
  });
});

app.post('/api/user/add', checkPermissions('manageUsers'), (req, res) => {
  const userName = req.body.userName;
  const userPassword = req.body.userPassword;

  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [userName, userPassword], (err, result) => {
      if (err) throw err;

      res.redirect('/dashboard');
  });
});

app.get('/api/user/groups', checkPermissions('manageUserGroups'), (req, res) => {
  db.query('SELECT * FROM user_group_permissions', (err, results) => {
    if (err) throw err;

    res.json(results);
  });
});

app.post('/api/user/groups/add', checkPermissions('manageUserGroups'),(req, res) => {
  const groupName = req.body.groupName;
  const groupPermissions = req.body.groupPermissions;

  db.query('INSERT INTO user_group_permissions (name, permissions) VALUES (?, ?)', [groupName, groupPermissions], (err, result) => {
      if (err) throw err;

      res.redirect('/dashboard');
  });
});

app.post('/api/user/groups/edit', checkPermissions('manageUserGroups'),(req, res) => {
  const groupId = req.body.groupId;
  const groupName = req.body.groupName;
  const groupPermissions = req.body.groupPermissions;

  db.query('UPDATE user_group_permissions SET name = ?, permissions = ? WHERE id = ?', [groupName, groupPermissions, groupId], (err, result) => {
      if (err) throw err;

      res.redirect('/dashboard');
  });
});

app.post('/api/user/groups/delete', checkPermissions('manageUserGroups'),(req, res) => {
  const groupId = req.body.groupId;

  db.query('DELETE FROM user_group_permissions WHERE id = ?', [groupId], (err, result) => {
      if (err) throw err;

      res.redirect('/dashboard');
  });
});

app.post('/api/auth/logout', checkLoggedIn, (req, res) => {
    req.session.destroy(err => {
        if (err) throw err;
        console.log('Logged out');
        res.redirect('/login');
    });
});




app.post('/api/auth/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const registrationKey = req.body.registrationKey;

  db.query('SELECT * FROM registration_keys WHERE regkey = ?', [registrationKey], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      res.status(400).send('Ungültiger Registrierungsschlüssel');
      return;
    }

    // Check if email is already in use
    db.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email], (err, emailResults) => {
      if (err) throw err;

      if (emailResults.length > 0) {
        res.status(400).send('Email bereits in Verwendung');
        return;
      }

      // Check if username is already in use
      db.query('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username], (err, usernameResults) => {
        if (err) throw err;

        if (usernameResults.length > 0) {
          res.status(400).send('Benutzername bereits in Verwendung');
          return;
        }

        bcrypt.hash(password, 10, (err, hash) => {
          if (err) throw err;

          db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash], (err, result) => {
            if (err) throw err;

            db.query('DELETE FROM registration_keys WHERE regkey = ?', [registrationKey], (err, result) => {
              if (err) throw err;
              console.log('Deleted registration key');
              res.redirect('/login');
            });
          });
        });
      });
    });
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const email = req.body.email;
  const userID = req.body.userID;
  const username = req.body.username;

  // Check if email, userID, or username is provided
  if (!email && !userID && !username) {
    res.status(400).send('Please provide email, userID, or username');
    return;
  }

  let query;
  let queryParams;

  // Determine the query based on the provided parameter
  if (email) {
    query = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)';
    queryParams = [email];
  } else if (userID) {
    query = 'SELECT * FROM users WHERE ID = ?';
    queryParams = [userID];
  } else {
    query = 'SELECT * FROM users WHERE LOWER(username) = LOWER(?)';
    queryParams = [username];
  }

  db.query(query, queryParams, (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      res.status(400).send('User not found');
      return;
    }

    const user = results[0];

    // Generate a new password
    const newPassword = Math.random().toString(36).substr(2, 10);

    // Update the user's password in the database
    bcrypt.hash(newPassword, 10, (err, hash) => {
      if (err) throw err;
      console.log ('New Password:', newPassword)
      db.query('UPDATE users SET password = ? WHERE ID = ?', [hash, user.userID], (err, result) => {
        if (err) throw err;

        // Send the new password to the user's email address
        sendPasswordResetEmail(user.email, newPassword);

        res.status(200).send('Password reset successful');
      });
    });
  });
});

app.post('/api/auth/password/reset', (req, res) => {
  const userId = req.body.userId;
  const newPassword = req.body.newPassword;

  bcrypt.hash(newPassword, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    db.query('UPDATE users SET password = ? WHERE id = ?', [hash, userId], (err, result) => {
      if (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      res.json({ success: true });
    });
  });
});

app.get('/api/auth/regkeys', checkPermissions('manageRegistrationKeys'), (req, res) => {
  db.query('SELECT * FROM registration_keys', (err, results) => {
      if (err) throw err;

      res.json(results);
  });
});

app.post('/api/auth/regkeys/add', checkPermissions('manageRegistrationKeys'), (req, res) => {
  const regkey = req.body.regkey;

  db.query('INSERT INTO registration_keys (regkey) VALUES (?)', [regkey], (err, result) => {
      if (err) throw err;

      res.redirect('/dashboard');
  });
});

app.post('/api/auth/regkeys/generate',  checkPermissions('manageRegistrationKeys'), (req, res) => {
  const regkey = Math.random().toString(36).substr(2, 10);

  db.query('INSERT INTO registration_keys (regkey) VALUES (?)', [regkey], (err, result) => {
      if (err) throw err;

      // Senden Sie die ID und den regkey als Antwort zurück
      res.json({ id: result.insertId, regkey: regkey });
  });
});

app.post('/api/auth/regkeys/delete',  checkPermissions('manageRegistrationKeys'), (req, res) => {
  const id = req.body.id;

  db.query('DELETE FROM registration_keys WHERE id = ?', [id], (err, result) => {
      if (err) {
          // Senden Sie eine Fehlermeldung zurück
          res.json({ success: false, message: 'Fehler beim Löschen des Schlüssels.' });
          throw err;
      }

      // Senden Sie eine Erfolgsmeldung zurück
      res.json({ success: true, id: id, status: 'deleted' });
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

// Middleware to check if the user is logged in and has the required permission
function checkPermissions(requiredPermission) {
  return function(req, res, next) {
    if (!req.session.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = req.session.user;
    const userId = req.session.user.id;

    const getGroupIdQuery = 'SELECT group_id FROM user_group_assignments WHERE user_id = ?';
    db.query(getGroupIdQuery, [userId], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
      } else {
        if (results.length === 0) {
          res.status(403).json({ error: 'Forbidden' });
          return;
        }

        const groupId = results[0].group_id;

        const getPermissionsQuery = 'SELECT permissions FROM user_group_permissions WHERE id = ?';
        db.query(getPermissionsQuery, [groupId], (err, results) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
          } else {
            const permissions = results[0].permissions.split(',');

            if (permissions.includes(requiredPermission)) {
              next();
            } else {
              res.status(403).json({ error: 'Forbidden' });
            }
          }
        });
      }
    });
  };
}

app.get('/login', (req, res) => {
  res.render('admin/login');
});

app.get('/register', (req, res) => {
  res.render('admin/register');
});

app.get('/dashboard', checkPermissions('viewDashboard'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.id + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/dashboard', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/account', checkPermissions('manageAccount'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.id + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/account', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/links/statistics', checkPermissions('manageLinks'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.id + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/statistics', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/registrationkeys', checkPermissions('manageRegistrationKeys'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.id + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/registration-keys', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/sessions', checkPermissions('superAdmin'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.id + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/sessions', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/faq', checkPermissions('manageFaq'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.id + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/faq', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.id + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/casinos', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/media/casinos', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.id + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/media_casinos', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/media/paymentmethods', checkPermissions('managePaymentMethods'), checkLoggedIn, (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.id + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/media_paymentmethods', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/media/provider', checkPermissions('manageProvider'), checkLoggedIn, (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.id + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/media_provider', { user: user });
  } catch (err) {
    next(err);
  }
});
app.get('/api/links/hits', checkPermissions('manageLinks'),(req, res) => {
  db.query('SELECT * FROM link_hits', (err, results) => {
    if (err) throw err;

    res.json(results);
  });
});

app.get('/api/links/count', checkPermissions('manageLinks'), (req, res) => {
  db.query('SELECT * FROM link_hits_count', (err, results) => {
    if (err) throw err;

    res.json(results);
  });
});




app.get('/api/media/casinos', checkPermissions('manageCasinos'), function(req, res) {
  fs.readdir(path.join('public/img/casinos'), function(err, files) {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.json(files);
  });
});

const storageCasinoImages = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/img/casinos');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploadCasinoImages = multer({
  storage: storageCasinoImages,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

app.post('/api/media/casinos/upload', checkPermissions('manageCasinos'), uploadCasinoImages.single('image'), function(req, res) {
  // Überprüfen Sie, ob ein Fehler aufgetreten ist
  if (req.fileValidationError) {
    return res.json({ error: req.fileValidationError });
  }

  // Das Bild wurde hochgeladen und ist jetzt unter 'req.file' verfügbar
  res.json({ success: true });
});

app.post('/api/media/casinos/delete', checkPermissions('manageCasinos'), function(req, res) {
  const imagePath = path.join('public/img/casinos', req.body.image);

  fs.unlink(imagePath, function(err) {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.json({ success: true });
  });
});


// Dashboard route



app.get('/api/media/paymentmethods', checkPermissions('managePaymentMethods'), function(req, res) {
  fs.readdir(path.join('public/img/paymentmethods'), function(err, files) {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.json(files);
  });
});

const storagePaymentmethodsImages = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/img/paymentmethods');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploadPaymentmethodsImages = multer({
  storage: storagePaymentmethodsImages,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

app.post('/api/media/paymentmethods/upload', checkPermissions('managePaymentMethods'), uploadPaymentmethodsImages.single('image'), function(req, res) {
  // Überprüfen Sie, ob ein Fehler aufgetreten ist
  if (req.fileValidationError) {
    return res.json({ error: req.fileValidationError });
  }

  // Das Bild wurde hochgeladen und ist jetzt unter 'req.file' verfügbar
  res.json({ success: true });
});

app.post('/api/media/paymentmethods/delete', checkPermissions('managePaymentMethods'), function(req, res) {
  const imagePath = path.join('public/img/paymentmethods', req.body.image);

  fs.unlink(imagePath, function(err) {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.json({ success: true });
  });
});

// Dashboard route



app.get('/api/media/provider', checkPermissions('manageProvider'), function(req, res) {
  fs.readdir(path.join('public/img/provider'), function(err, files) {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.json(files);
  });
});

const storageProviderImages = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/img/provider');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploadProviderImages = multer({
  storage: storageProviderImages,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

app.post('/api/media/provider/upload', checkPermissions('manageProvider'), uploadProviderImages.single('image'), function(req, res) {
  // Überprüfen Sie, ob ein Fehler aufgetreten ist
  if (req.fileValidationError) {
    return res.json({ error: req.fileValidationError });
  }

  // Das Bild wurde hochgeladen und ist jetzt unter 'req.file' verfügbar
  res.json({ success: true });
});

app.post('/api/media/provider/delete', checkPermissions('manageProvider'), function(req, res) {
  const imagePath = path.join('public/img/provider', req.body.image);

  fs.unlink(imagePath, function(err) {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.json({ success: true });
  });
});

app.get('/api/casinos/get', checkPermissions('manageCasinos'), (req, res) => {
  db.query('SELECT * FROM casinos', (err, results) => {
      if (err) throw err;

      res.json(results);
  });
});

app.get('/api/casinos/get/:id', checkPermissions('manageCasinos'), (req, res) => {
  const id = req.params.id;

  db.query('SELECT * FROM casinos WHERE id = ?', [id], (err, results) => {
      if (err) throw err;

      res.json(results);
  });
});

app.post('/api/casinos/add', checkPermissions('manageCasinos'), (req, res) => {
  const json_data = req.body.json_data;
  console.log (json_data);

  const bodyParser = require('body-parser');
  app.use(bodyParser.json());

  db.query('INSERT INTO casinos (json_data) VALUES (?)', [json_data], (err, result) => {
      if (err) throw err;

      res.redirect('/dashboard/casinos');
  });
});

app.post('/api/casinos/update', checkPermissions('manageCasinos'), (req, res) => {
  const id = req.body.id;
  const json_data = req.body.json_data;

  db.query('UPDATE casinos SET json_data = ? WHERE id = ?', [json_data, id], (err, result) => {
      if (err) throw err;

      res.redirect('/dashboard/casinos');
  });
});

app.post('/api/casinos/delete', checkPermissions('manageCasinos'), (req, res) => {
  const id = req.body.id;

  db.query('DELETE FROM casinos WHERE id = ?', [id], (err, result) => {
      if (err) throw err;

      res.redirect('/dashboard/casinos');
  });
});

app.post('/api/casinos/deploy', checkPermissions('manageCasinos'), (req, res) => {
  db.query('SELECT json_data FROM casinos', (err, results) => {
      if (err) throw err;

      const jsonData = results.map(row => {
          let data = row.json_data.trim();
          if (data.startsWith('{') && data.endsWith('}')) {
              return JSON.parse(data);
          } else {
              // Handle invalid JSON data
              console.error('Invalid JSON data:', data);
              return null;
          }
      }).filter(item => item !== null);

      fs.writeFile('private/data/casinos.json', JSON.stringify(jsonData, null, 2), (err) => {
          if (err) throw err;

          res.json({ message: 'Data saved to casinos.json' });
      });
  });
});

app.post('/api/casinos/backup/create', checkPermissions('manageCasinos'), (req, res) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0');
  const backupTableName = `bk_casinos_${year}${month}${day}T${hours}${minutes}${seconds}${milliseconds}Z`;

  // Create a new table and fill it with the data from the 'data' table
  db.query(`CREATE TABLE ${backupTableName} AS SELECT * FROM casinos`, (err, result) => {
      if (err) throw err;

      res.json({ success: true });
  });
});

app.post('/api/casinos/backup/delete', checkPermissions('manageCasinos'), (req, res) => {
  const tableName = req.body.table;

  // Drop the selected table
  db.query(`DROP TABLE ${tableName}`, (err, result) => {
      if (err) throw err;

      res.json({ success: true });
  });
});

app.post('/api/casinos/backup/show', checkPermissions('manageCasinos'), (req, res) => {
  const tableName = req.body.table;

  // Check if the table name starts with 'bk_casinos_'
  if (!tableName.startsWith('bk_casinos_')) {
      return res.status(400).json({ error: 'Ungültiger Tabellenname' });
  }

  // Query the database to get all data from the specified table
  db.query(`SELECT * FROM ${tableName}`, (err, result) => {
      if (err) throw err;

      // Send the data as a response
      res.json(result);
  });
});

app.get('/api/casinos/backup/get', checkPermissions('manageCasinos'), (req, res) => {
  db.query("SHOW TABLES LIKE 'bk_casinos_%'", (err, results) => {
      if (err) throw err;

      // Extract table names from the results
      const tableNames = results.map(row => Object.values(row)[0]);

      res.json(tableNames);
  });
});

app.post('/api/casinos/backup/restore', checkPermissions('manageCasinos'), (req, res) => {
  const tableName = req.body.table;

  // Drop the existing 'data' table
  db.query('DROP TABLE IF EXISTS casinos', (err, result) => {
    if (err) throw err;

    // Create a new 'data' table and fill it with the data from the selected table
    db.query(`CREATE TABLE casinos (
      id INT(11) NOT NULL AUTO_INCREMENT,
      json_data MEDIUMTEXT NOT NULL,
      PRIMARY KEY (id)
    ) AS SELECT * FROM ${tableName}`, (err, result) => {
      if (err) throw err;

      res.json({ success: true });
    });
  });
});

// Planen Sie eine Aufgabe, um ein Backup alle 24 Stunden zu erstellen
schedule.scheduleJob('0 0 * * *', () => {
  const currentDate = new Date();
  const backupTableName = `bk_casinos_auto_${currentDate.toISOString().replace(/[-:.T]/g, '').slice(0, -5)}Z`;

  db.query(`CREATE TABLE ${backupTableName} AS SELECT * FROM casinos`, (err, result) => {
    if (err) throw err;

    console.log(`Backup ${backupTableName} created`);
  });
});

// Planen Sie eine Aufgabe, um Backups, die älter als 30 Tage sind, zu löschen
schedule.scheduleJob('0 0 * * *', () => {
  const date30DaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const oldestBackupTableName = `bk_casinos_auto_${date30DaysAgo.toISOString().replace(/[-:.T]/g, '').slice(0, -5)}Z`;

  db.query(`DROP TABLE IF EXISTS ${oldestBackupTableName}`, (err, result) => {
    if (err) throw err;

    console.log(`Backup ${oldestBackupTableName} deleted`);
  });
});


app.get('/api/faq/get', checkPermissions('manageFaq'), (req, res) => {
  db.query('SELECT * FROM faq', (err, results) => {
      if (err) throw err;

      res.json(results);
  });
});

app.post('/api/faq/add', checkPermissions('manageFaq'), (req, res) => {
  const question = req.body.question;
  const answer = req.body.answer;
  const sortingorder = req.body.sortingorder;
  console.log (question, answer, sortingorder);

  const bodyParser = require('body-parser');
  app.use(bodyParser.json());

  db.query('INSERT INTO faq (question, answer, sortingorder) VALUES (?, ?, ?)', [question, answer, sortingorder], (err, result) => {
      if (err) throw err;

      res.redirect('/dashboard');
  });
});

app.post('/api/faq/deploy', checkPermissions('manageFaq'), (req, res) => {
  db.query('SELECT * FROM faq', (err, results) => {
      if (err) throw err;

      fs.writeFile('private/data/faq.json', JSON.stringify(results, null, 2), (err) => {
          if (err) throw err;

          res.json({ message: 'Data saved to faq.json' });
      });
  });
});

app.post('/api/faq/update', checkPermissions('manageFaq'), (req, res) => {
  const id = req.body.id;
  const question = req.body.question;
  const answer = req.body.answer;
  const sortingorder = req.body.sortingorder;

  db.query('UPDATE faq SET question = ?, answer = ?, sortingorder = ? WHERE id = ?', [question, answer, sortingorder, id], (err, result) => {
      if (err) throw err;

      res.redirect('/dashboard');
  });
});

app.post('/api/faq/delete', checkPermissions('manageFaq'), (req, res) => {
  const id = req.body.id;

  db.query('DELETE FROM faq WHERE id = ?', [id], (err, result) => {
      if (err) throw err;

      res.redirect('/dashboard');
  });
});

app.get('/api/faq/backup/get', checkPermissions('manageFaq'), (req, res) => {
  db.query("SHOW TABLES LIKE 'bk_faq_%'", (err, results) => {
      if (err) throw err;

      // Extract table names from the results
      const tableNames = results.map(row => Object.values(row)[0]);

      res.json(tableNames);
  });
});

app.post('/api/faq/backup/restore', checkPermissions('manageFaq'), (req, res) => {
  const tableName = req.body.table;

  // Drop the existing 'data' table
  db.query('DROP TABLE IF EXISTS faq', (err, result) => {
    if (err) throw err;

    // Create a new 'data' table and fill it with the data from the selected table
    db.query(`CREATE TABLE faq (
      id INT(11) NOT NULL AUTO_INCREMENT,
      question VARCHAR(255) NOT NULL,
      answer VARCHAR(255) NOT NULL,
      sortingorder INT(11) NOT NULL,
      PRIMARY KEY (id)
    ) AS SELECT * FROM ${tableName}`, (err, result) => {
      if (err) throw err;

      res.json({ success: true });
    });
  });
});

app.post('/api/faq/backup/delete', checkPermissions('manageFaq'), (req, res) => {
  const tableName = req.body.table;

  // Drop the selected table
  db.query(`DROP TABLE ${tableName}`, (err, result) => {
      if (err) throw err;

      res.json({ success: true });
  });
});

app.post('/api/faq/backup/show', checkPermissions('manageFaq'), (req, res) => {
const tableName = req.body.table;

// Check if the table name starts with 'bk_data_'
if (!tableName.startsWith('bk_faq_')) {
    return res.status(400).json({ error: 'Ungültiger Tabellenname' });
}

// Query the database to get all data from the specified table
db.query(`SELECT * FROM ${tableName}`, (err, result) => {
    if (err) throw err;

    // Send the data as a response
    res.json(result);
});
});

app.post('/api/faq/backup/create', checkPermissions('manageFaq'), (req, res) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0');
  const backupTableName = `bk_faq_${year}${month}${day}T${hours}${minutes}${seconds}${milliseconds}Z`;

  // Create a new table and fill it with the data from the 'data' table
  db.query(`CREATE TABLE ${backupTableName} AS SELECT * FROM faq`, (err, result) => {
      if (err) throw err;

      res.json({ success: true });
  });
});

app.get('/api', (req, res) => {
  // Hier kannst du deinen serverseitigen Code einfügen
  res.send('Hello World!');
});

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
        const timestamp = Date.now();
        const name = link.name.toLowerCase();
        db.query(`INSERT INTO link_hits (name, timestamp) VALUES (?, ?)`, [name, timestamp], (err) => {
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
        const timestamp = Date.now();

        // transform to lowercase before inserting into database
        const name = casino.name.toLowerCase();
        // const name = casino.name.toLowerCase();
        db.query(`INSERT INTO link_hits (name, timestamp) VALUES (?, ?)`, [name, timestamp], (err) => {
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
  db.all('SELECT name, COUNT(*) AS hits FROM link_hits GROUP BY name', (err, rows) => {
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


const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const checkPermissions = require('./middlewares/permissionMiddleware.js');

// Error Handler
const errorHandler = require('./modules/errorHandler.js');

const logger = require('./modules/winston.js');

const emailVerificator = require('./services/emailVerificationService.js');
const checkUnverifiedEmails = emailVerificator.checkUnverifiedEmails;

// Database Engine
const db = require('./db/database.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const api = require('./services/casinoWishListBot.js');

// 
const { processOrders } = require('./modules/Orders/servicesOrderHandler.js');

const cron = require('node-cron');
cron.schedule('*/10 * * * * *', () => {
  console.log('Calling processOrders()');
    processOrders();
});



io.on('connection', (socket) => {
  logger.info('New client connected');

  socket.emit('notification', {
    message: 'Willkommen beim WebSocket-Server'
  });

  socket.emit('notification', {
    message: 'Willkommen beim WebSocket-Server'
  });

  socket.on('notification', (data) => {
    console.log('Benachrichtigung vom Client empfangen:', data);
  });
});

// Middleware

app.use(express.static(path.join('public')));

const fileUpload = require('express-fileupload');
app.use(fileUpload()); // Don't forget this line!


app.use(helmet());

const scriptSrcUrls = [
  "https://analytics.yasarbonus.com/",
  "https://kit.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://cdn.socket.io/",
  "'unsafe-inline'"
];

const scriptSrcAttr = [
  "'unsafe-inline'"
];

const styleSrcUrls = [
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
  "https://ka-f.fontawesome.com/",

];
const fontSrcUrls = [
  "https://cdn.jsdelivr.net/",
  "https://ka-f.fontawesome.com/",
  "data:",
];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          scriptSrcAttr: ["'self'", "'unsafe-inline'", ...scriptSrcAttr],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://cdn.treudler.net/" ,
              "http://localhost:9000/"
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({
  extended: true
}));

// Set a timeout for all requests
app.use((req, res, next) => {
  setTimeout(next, 50);
});

// Session Storage
const MongoStore = require('connect-mongo');
const session = require('express-session');

let mongooseUrl = '';

console.log('process.env.MODE_ENV', process.env.NODE_ENV)

if (process.env.NODE_ENV === 'development') {
  mongooseUrl = process.env.MONGOOSE_DEV_URL;
} else if (process.env.NODE_ENV === 'production') {
  mongooseUrl = process.env.MONGOOSE_PROD_URL;
}

app.use(session({
  secret: 'aisei0aeb9ba4vahgohC5heeke5Rohs5oi9ohyuepadaeGhaeP2lahkaecae',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  },
  store: MongoStore.create({
    mongoUrl: mongooseUrl,
  })
}));
//

const getTenancyByUserId = async (userId) => {
  try {
    const user = await db.User.findById(userId);
    if (user) {
      return user.tenancy;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};

// API Routes

const pathV1 = '/api/v1';

const authRoutes = require('./routes/authRoutes.js');
app.use(pathV1 + '/auth', authRoutes);

const tenanciesRoutes = require('./routes/tenanciesRoutes.js');
app.use(pathV1 + '/tenancies', tenanciesRoutes);

const registrationKeysRoutes = require('./routes/registrationKeysRoutes.js');
app.use(pathV1 + '/registrationkeys', registrationKeysRoutes);

const userRoutes = require('./routes/userRoutes.js');
app.use(pathV1 + '/user', userRoutes);

const usersRoutes = require('./routes/usersRoutes.js');
app.use(pathV1 + '/users', usersRoutes);

const casinosCategoriesRoutes = require('./routes/Casinos/casinosCategoriesRoutes.js');
app.use(pathV1 + '/casinos/categories', casinosCategoriesRoutes);

const casinosFeaturesRoutes = require('./routes/Casinos/casinosFeaturesRoutes.js');
app.use(pathV1 + '/casinos/features', casinosFeaturesRoutes);

const casinosLicensesRoutes = require('./routes/Casinos/casinosLicensesRoutes.js');
app.use(pathV1 + '/casinos/licenses', casinosLicensesRoutes);

const casinosPaymentMethodsRoutes = require('./routes/Casinos/casinosPaymentMethodsRoutes.js');
app.use(pathV1 + '/casinos/paymentmethods', casinosPaymentMethodsRoutes);

const casinosProvidersRoutes = require('./routes/Casinos/casinosProvidersRoutes.js');
app.use(pathV1 + '/casinos/providers', casinosProvidersRoutes);

const casinosWagerTypesRoutes = require('./routes/Casinos/casinosWagerTypesRoutes.js');
app.use(pathV1 + '/casinos/wagertypes', casinosWagerTypesRoutes);

const casinosTagsRoutes = require('./routes/Casinos/casinosTagsRoutes.js');
app.use(pathV1 + '/casinos/tags', casinosTagsRoutes);

// const casinosRoutes = require('./routes/Casinos/casinosRoutes.js');
// app.use(pathV1 + '/casinos', casinosRoutes);

const imagesCategoriesRoutes = require('./routes/Images/imagesCategoriesRoutes.js');
app.use(pathV1 + '/images/categories', imagesCategoriesRoutes);

const imagesRoutes = require('./routes/Images/imagesRoutes.js');
app.use(pathV1 + '/images', imagesRoutes);

const shortLinksRoutes = require('./routes/shortLinksRoutes.js');
app.use(pathV1 + '/shortlinks', shortLinksRoutes);

const ordersRoutes = require('./routes/ordersRoutes.js');
app.use(pathV1 + '/orders', ordersRoutes);

const casinoWishListBotRoutes = require('./routes/casinoWishListBotRoutes.js');
app.use(pathV1 + '/casinowishlistbot', casinoWishListBotRoutes);

const servicesRoutes = require('./routes/servicesRoutes.js');
app.use(pathV1 + '/services', servicesRoutes);

const pointsRoutes = require('./routes/pointsRoutes.js');
app.use(pathV1 + '/points', pointsRoutes);


// const proxmoxRoutes = require('./routes/proxmoxRoutes.js');
// app.use(pathV1 + '/proxmox', proxmoxRoutes);

// Routes for rendering views
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
  res.render('admin/login');
});

app.get('/register', (req, res) => {
  res.render('admin/register');
});

app.get('/dashboard', checkPermissions('viewDashboard'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/dashboard', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/account', checkPermissions('manageAccount'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/account', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/registrationkeys', checkPermissions('manageRegistrationKeys'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/super_registrationkeys', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/sessions', checkPermissions('manageSessions'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/super_sessions', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/users', checkPermissions('manageUsers'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/super_users', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/users/:userId/edit', checkPermissions('manageUsers'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed user edit');
    const user = req.session.user;
    const userId = req.params.userId;

    res.render('admin/super_users_edit', {
      user: user,
      userId: userId
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/tenancies', checkPermissions('manageTenancies'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed tenancies');
    const user = req.session.user;
    res.render('admin/super_tenancies', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/services', checkPermissions('manageServices'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed services');
    const user = req.session.user;
    res.render('admin/super_services', {
      user: user
    });
  } catch (err) {
    next(err);
  }
} );

app.get('/dashboard/casinos', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/casinos', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/categories', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/casinos_categories', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/features', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;

    res.render('admin/casinos_features', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/providers', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed providers');
    const user = req.session.user;

    res.render('admin/casinos_providers', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/licenses', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed licenses');
    const user = req.session.user;

    res.render('admin/casinos_licenses', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/paymentmethods', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed paymentmethods');
    const user = req.session.user;

    res.render('admin/casinos_paymentmethods', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/wagertypes', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') wagertypes');
    const user = req.session.user;

    res.render('admin/casinos_wagertypes', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/tags', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed tags');
    const user = req.session.user;

    res.render('admin/casinos_tags', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/:id/edit', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed casino edit');
    const user = req.session.user;
    const id = req.params.id;

    res.render('admin/casinos_edit', {
      user: user,
      casinoId: id
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/:id', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed casino edit');
    const user = req.session.user;
    const id = req.params.id;

    res.redirect('/dashboard/casinos/' + id + '/edit');
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/images/categories', checkPermissions('manageImagesCategories'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/images_categories', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/images', checkPermissions('manageImages'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/images', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/shortlinks', checkPermissions('manageShortLinks'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') shortlinks');
    const user = req.session.user;

    res.render('admin/shortlinks', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/shortlinks/hits', checkPermissions('manageShortLinks'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') shortlinks');
    const user = req.session.user;

    res.render('admin/shortlinks_hits', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/shortlinks/:id/statistics', checkPermissions('manageShortLinks'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') shortlinks');
    const user = req.session.user;
    const id = req.params.id;

    res.render('admin/shortlinks_statistics', {
      user: user,
      shortLink: id
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/utils/twitch/casinowishlistbot', checkPermissions('manageCasinoWishListBot'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed casino wishlist bot');
    const user = req.session.user;

    res.render('admin/utils_twitch_casinowishlistbot', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

// Swagger API Documentation
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./config/SwaggerOptions.js');

const specs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Function to delete unused registration keys older than 1 hour
function deleteUnusedRegistrationKeys() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

  db.RegistrationKey.deleteMany({
      used: false,
      created: {
        $lt: oneHourAgo
      }
    })
    .then(() => {
      const deletedKeys = db.RegistrationKey.deletedCount;
    })
    .catch((error) => {
      console.error('Error deleting unused registration keys:', error);
    });
}

async function setCasinoImageUrl(casinoId = null) {
  try {
    let casinos;
    if (casinoId) {
      casinos = await db.Casino.findOne({
        _id: casinoId
      });
      casinos = [casinos]; // Convert single object to array
    } else {
      casinos = await db.Casino.find();
    }
    for (const casino of casinos) {
      if (casino.image) {
        const image = await db.Images.findOne({
          _id: casino.image
        });
        if (image) {
          casino.imageUrl = `/img/images/${image.filename}`;
          casino.tenancies = casino.tenancies;
          await casino.save();
        }
      }
    }
  } catch (error) {
    errorHandler(error);
  }
}

async function setImageUrl(id = null) {
  try {
    let images;
    if (id) {
      images = await db.Images.findOne({
        _id: id
      });
      images = [images]; // Convert single object to array
    } else {
      images = await db.Images.find();
    }
    for (const image of images) {
      if (image.filename) {
        const foundImage = await db.Images.findOne({
          _id: image._id
        });
        if (foundImage) {
          foundImage.imageUrl = `/img/images/${foundImage.filename}`;
          foundImage.tenancies = foundImage.tenancies;
          await foundImage.save();
        }
      }
    }
  } catch (error) {
    console.error('Error retrieving images:', error);
  }
}

async function createShortLinks(casinoId = null) {
  try {
    let casinos;
    if (casinoId) {
      casinos = await db.Casino.findOne({
        _id: casinoId
      });
      casinos = [casinos]; // Convert single object to array
    } else {
      casinos = await db.Casino.find();
    }
    for (const casino of casinos) {
      if (casino.affiliateUrl && casino.affiliateShortlink) {
        const existingShortLink = await db.ShortLinks.findOne({
          attachedTo: casino._id,
          tenancies: casino.tenancies,
        });
        if (existingShortLink) {
          existingShortLink.url = casino.affiliateUrl;
          existingShortLink.shortUrl = casino.affiliateShortlink;
          existingShortLink.modifiedBy = casino.modifiedBy;
          existingShortLink.modifiedDate = casino.modifiedDate;
          existingShortLink.tenancies = casino.tenancies;
          existingShortLink.attachedTo = casino._id;
          await existingShortLink.save();
        } else {
          const shortLink = await db.ShortLinks.create({
            url: casino.affiliateUrl,
            shortUrl: casino.affiliateShortlink,
            description: 'Belongs to Casino ' + casino.name,
            addedBy: casino.addedBy,
            addedDate: casino.addedDate,
            modifiedBy: casino.modifiedBy,
            modifiedDate: casino.modifiedDate,
            attachedTo: casino._id,
            tenancies: casino.tenancies
          });
          console.log('ShortLink created for casino ' + casino.name + ' (' + shortLink._id + ')');
        }
      }
    }
  } catch (error) {
    errorHandler(error);
  }
}

async function updateShortLinksStatistics() {
  try {
    // Get all short links from the database
    const shortLinks = await db.ShortLinks.find();

    // Loop through all short links
    for (const shortLink of shortLinks) {
      // Get the number of hits for the short link
      const shortLinkHits = await db.ShortLinksHits.countDocuments({
        shortLink: shortLink._id
      });

      // Get the number of hits in the past 1 hour
      const shortLinkHits1h = await db.ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 3 hours
      const shortLinkHits3h = await db.ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 6 hours
      const shortLinkHits6h = await db.ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 12 hours
      const shortLinkHits12h = await db.ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 24 hours
      const shortLinkHits24h = await db.ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 7 days
      const shortLinkHits7d = await db.ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 30 days
      const shortLinkHits30d = await db.ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 12 months
      const shortLinkHits12m = await db.ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        },
      });

      // Update the short link object with the new statistics
      shortLink.hits = shortLinkHits;
      shortLink.hits1h = shortLinkHits1h;
      shortLink.hits3h = shortLinkHits3h;
      shortLink.hits6h = shortLinkHits6h;
      shortLink.hits12h = shortLinkHits12h;
      shortLink.hits24h = shortLinkHits24h;
      shortLink.hits7d = shortLinkHits7d;
      shortLink.hits30d = shortLinkHits30d;
      shortLink.hits12m = shortLinkHits12m;

      // Check if the short link statistics object already exists
      const shortLinkStatistics = await db.ShortLinksStatistics.findOne({
        shortLink: shortLink._id
      });

      if (shortLinkStatistics) {
        // Update the existing short link statistics object
        shortLinkStatistics.hits = shortLinkHits;
        shortLinkStatistics.hits1h = shortLinkHits1h;
        shortLinkStatistics.hits3h = shortLinkHits3h;
        shortLinkStatistics.hits6h = shortLinkHits6h;
        shortLinkStatistics.hits12h = shortLinkHits12h;
        shortLinkStatistics.hits24h = shortLinkHits24h;
        shortLinkStatistics.hits7d = shortLinkHits7d;
        shortLinkStatistics.hits30d = shortLinkHits30d;
        shortLinkStatistics.hits12m = shortLinkHits12m;
        await shortLinkStatistics.save();
      } else {
        // Create a new short link statistics object
        await db.ShortLinksStatistics.create({
          shortLink: shortLink._id,
          hits: shortLinkHits,
          hits1h: shortLinkHits1h,
          hits3h: shortLinkHits3h,
          hits6h: shortLinkHits6h,
          hits12h: shortLinkHits12h,
          hits24h: shortLinkHits24h,
          hits7d: shortLinkHits7d,
          hits30d: shortLinkHits30d,
          hits1d2m: shortLinkHits12m,
          tenancies: shortLink.tenancies
        });
      }

      // Save the updated short link object
      await shortLink.save();
    }
  } catch (error) {
    errorHandler(error);
  }
}

// Call the function on startup, then every hour
updateShortLinksStatistics();
setInterval(updateShortLinksStatistics, 60 * 60 * 1000);

createShortLinks();

// Run the function on startup, then every hour
deleteUnusedRegistrationKeys();
setInterval(deleteUnusedRegistrationKeys, 60 * 60 * 1000);

setCasinoImageUrl();
setInterval(setCasinoImageUrl, 60 * 60 * 1000);

setImageUrl();
setInterval(setImageUrl, 60 * 60 * 1000);

checkUnverifiedEmails();

// Route zum Umleiten von kurzen URLs
app.get('/:shortUrl', async (req, res, next) => {
  try {
    const {
      shortUl
    } = req.params;
    const url = await db.ShortLinks.findOne({
      shortUrl
    });
    if (url) {
      // Record link hit to shortLinksHits table
      await db.ShortLinksHits.create({
        shortLink: url._id,
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        tenancies: url.tenancies
      });

      res.redirect(url.url);
    } else {
      res.status(404).send({
        error: 'Url not found'
      });
    }
  } catch (err) {
    next(err);
  }
});

// addNotification('65834f6fefa5bb088ca50288', 'info', 'Na', 'Test', 'email');

// Error handler
app.use(errorHandler);

// Close the MongoDB connection when the server is shut down
process.on('SIGINT', () => {
  mongoose.connection.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the MongoDB connection.');
    process.exit(0);
  });
});

// Start the server
const port = 3000;
server.listen(port, () => {
  logger.info(`Server is listening at http://localhost:${port}`);
});
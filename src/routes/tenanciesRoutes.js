const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const notificator = require('../services/notificationService.js');
const checkPermissions = require('../middlewares/permissionMiddleware.js');
const addNotification = notificator.addNotification;

/**
 * @openapi
 * /tenancies:
 *   post:
 *     summary: Create a new Tenant
 *     tags: [Tenants, Super]
 */
router.post('/', checkPermissions('manageTenancies'), (req, res) => {
  const {
    name,
    notes,
    type,
    image
  } = req.body;
  const userId = req.session.user.userId;

  if (!name) {
    res.status(400).json({
      error: 'Name is required'
    });
    return;
  }

  const tenancie = new db.Tenancies({
    name,
    notes,
    createdBy: userId,
    createdDate: new Date(),
    admins: [userId],
    image,
    type
  });

  tenancie.save()
    .then(() => {
      res.status(201).json({
        success: true
      });
    })
    .catch((error) => {
      console.error('Error inserting tenancie:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

/**
 * @openapi
 * /tenancies:
 *   get:
 *     summary: Get all tenancies
 *     tags: [Tenants, Super]
 */
router.get('/', checkPermissions('manageTenancies'), (req, res) => {
    db.Tenancies.find().populate('createdBy').populate('type').populate('image')
      .then((tenancies) => {
        res.json(tenancies);
      })
      .catch((error) => {
        console.error('Error getting tenancies:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  } );

/**
 * @openapi
 * /tenancies/types:
 *   get:
 *     summary: Get all tenancies types
 *     tags: [Tenants, Super]
 */
router.get('/types', checkPermissions('manageTenancies'), (req, res) => {
    db.TenanciesTypes.find()
      .then((types) => {
        res.json(types);
      })
      .catch((error) => {
        console.error('Error getting tenancies types:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  }
);

    /**
 * @openapi
 * /tenancies/{id}:
 *   get:
 *     summary: Get the details of a Tenant by ID
 *     tags: [Tenants, Super]
 */
router.get('/:id', checkPermissions('manageTenancies'), (req, res) => {
    const {
      id
    } = req.params;
  
    db.Tenancies.findById(id).populate('createdBy').populate('type').populate('image')
      .then((tenancie) => {
        if (!tenancie) {
          res.status(404).json({
            error: 'Tenancie not found'
          });
          return;
        }
  
        res.json(tenancie);
      })
      .catch((error) => {
        console.error('Error getting tenancie:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  /**
 * @openapi
 * /tenancies/{id}:
 *   put:
 *     summary: Update a Tenant by ID
 *     tags: [Tenants, Super]
 */
  router.put('/:id', checkPermissions('manageTenancies'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      name,
      notes,
      createdBy,
      createdDate,
      modifiedBy,
      modifiedDate,
      image
    } = req.body;
  
    if (!name) {
      res.status(400).json({
        error: 'Name is required'
      });
      return;
    }
  
    db.Tenancies.findByIdAndUpdate(id, {
        name,
        notes,
        createdBy,
        createdDate,
        modifiedBy,
        modifiedDate,
        image
      })
      .then(() => {
        res.json({
          success: true
        });
      })
      .catch((error) => {
        console.error('Error updating tenancie:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
/**
 * @openapi
 * /tenancies/{id}:
 *   delete:
 *     summary: Delete a Tenant by ID
 *     tags: [Tenants, Super]
 */
  router.delete('/:id', checkPermissions('manageTenancies'), (req, res) => {
    const {
      id
    } = req.params;
  
    db.Tenancies.findByIdAndDelete(id)
      .then(() => {
        res.json({
          success: true
        });
      })
      .catch((error) => {
        console.error('Error deleting tenancie:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

module.exports = router;
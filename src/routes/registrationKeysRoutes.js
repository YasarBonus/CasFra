const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const notificator = require('../services/notificationService.js');
const checkPermissions = require('../middlewares/permissionMiddleware.js');
const addNotification = notificator.addNotification;

// Get all registration keys from MongoDB
router.get('/', checkPermissions('manageRegistrationKeys'), (req, res) => {
    db.RegistrationKey.find()
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving registration keys:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Insert registration key into MongoDB
  router.post('/', checkPermissions('manageRegistrationKeys'), (req, res) => {
    const {
      regkey
    } = req.body;
  
    const registrationKey = new db.RegistrationKey({
      regkey: regkey
    });
  
    registrationKey.save()
      .then(() => {
        res.redirect('/dashboard');
      })
      .catch((error) => {
        console.error('Error inserting registration key:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Generate and insert registration key into MongoDB
  router.post('/generate', checkPermissions('manageRegistrationKeys'), (req, res) => {
    const regkey = Math.random().toString(36).substr(2, 10);
  
    const registrationKey = new db.RegistrationKey({
      regkey: regkey
    });
  
    registrationKey.save()
      .then((result) => {
        res.json({
          id: result._id,
          regkey: regkey
        });
      })
      .catch((error) => {
        console.error('Error generating registration key:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Delete registration key from MongoDB by ID
  router.delete('/:id', checkPermissions('manageRegistrationKeys'), (req, res) => {
    const { id } = req.params;

    db.RegistrationKey.findById(id)
      .then((registrationKey) => {
        if (!registrationKey) {
          throw new Error('Registration key not found');
        }

        if (registrationKey.used) {
          throw new Error('Cannot delete a used registration key');
        }

        return db.RegistrationKey.deleteOne({ _id: id });
      })
      .then((result) => {
        if (result.deletedCount === 0) {
          throw new Error('Registration key not found');
        }

        res.json({
          success: true,
          id: id,
          status: 'deleted'
        });
        console.log('Registration key deleted');
      })
      .catch((error) => {
        console.error('Error deleting registration key:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });



module.exports = router;
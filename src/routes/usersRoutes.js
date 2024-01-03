const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const notificator = require('../services/notificationService.js');
const checkPermissions = require('../middlewares/permissionMiddleware.js');
const addNotification = notificator.addNotification;

// Get all users from MongoDB
router.get('/', checkPermissions('manageUsers'), (req, res) => {
    db.User.find().populate('group').populate('tenancy').populate('tenancies')
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving users:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Delete user from MongoDB by ID
  router.delete('/', checkPermissions('manageUsers'), (req, res) => {
    const {
      id
    } = req.body; // Get the ID from the request body
    db.User.deleteOne({
        _id: id
      })
      .then((result) => {
        if (result.deletedCount === 0) {
          throw new Error('User not found');
        }
        res.json({
          success: true,
          id: id,
          status: 'deleted'
        });
        console.log('User deleted');
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get details of a user by ID
  router.get('/:id', checkPermissions('manageUsers'), (req, res) => {
    const {
      id
    } = req.params;
  
    db.User.findById(id).populate('group').populate('tenancy').populate('tenancies')
      .then((result) => {
        if (!result) {
          res.status(404).json({
            error: 'User not found'
          });
          return;
        }
  
        res.json(result);
      })
      .catch((error) => {
        console.error('Error retrieving user:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Edit user details by ID
  router.put('/:id', checkPermissions('manageUsers'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      username,
      nickname,
      active,
      banned,
      groupId,
      tenancies,
      tenancy,
      email
    } = req.body;
  
    if (!username) {
      res.status(400).json({
        error: 'Username is required'
      });
      return;
    }
  
    db.User.findByIdAndUpdate(id, {
        username,
        nickname,
        email,
        active,
        banned,
        groupId,
        tenancies,
        tenancy,
        emails: {
          email: email,
          is_primary: true
        }
      })
      .then(() => {
        res.json({
          success: true
        });
      })
      .catch((error) => {
        console.error('Error updating user:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

  module.exports = router;
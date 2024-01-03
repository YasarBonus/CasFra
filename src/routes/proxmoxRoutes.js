const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const notificator = require('../services/notificationService.js');
const checkPermissions = require('../middlewares/permissionMiddleware.js');
const addNotification = notificator.addNotification;


// Get all proxmoxServers from MongoDB
router.get('/', checkPermissions('manageProxmoxServers'), (req, res) => {
    db.ProxmoxServers.find().populate('proxmox_logs').exec()
      .then((proxmoxServers) => {
        res.json(proxmoxServers);
      })
      .catch((error) => {
        console.error('Error getting proxmoxServers:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  } );

module.exports = router;
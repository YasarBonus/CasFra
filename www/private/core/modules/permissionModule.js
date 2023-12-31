const mongoose = require('mongoose');
const db = require('../database/database.js');

// Middleware to check if the user is logged in and has the required permission
function checkPermissions(requiredPermission) {
    return async function (req, res, next) {
      try {
        if (!req.session.user) {
          return res.status(401).json({
            error: 'Unauthorized'
          });
        }
  
        const userId = req.session.user.userId;
        const user = await db.User.findById(userId);
  
        if (!user) {
          return res.status(403).json({
            error: 'Forbidden'
          });
        }
  
        const groupId = user.groupId;
        const userGroup = await db.UserGroup.findById(groupId);
  
        if (!userGroup) {
          return res.status(403).json({
            error: 'Forbidden'
          });
        }
  
        const permissions = userGroup.permissions;
  
        if (permissions.includes(requiredPermission)) {
          next();
        } else {
          return res.status(403).json({
            error: 'Forbidden'
          });
        }
      } catch (error) {
        console.error('Error retrieving user or user group:', error);
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
    };
  }

// Check if the user is authenticated
const checkAuthentication = async (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({
            error: 'Not authenticated'
        });
    }
};

module.exports = checkPermissions, checkAuthentication;
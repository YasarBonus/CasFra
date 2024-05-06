const mongoose = require('mongoose');
const db = require('../db/database.js');
const notificator = require('../services/notificationService.js');
const addNotification = notificator.addNotification;

// Middleware to check if the user is logged in and has the required permission
function checkPermissions(requiredPermission) {
    return async function (req, res, next) {
      try {
        if (!req.session.user) {
          return res.redirect('/login');
        };
      
        const userId = req.session.user.userId;
        const user = await db.User.findById(userId);
  
        if (!user) {
          return res.status(403).json({
            error: 'Forbidden'
          });
        }
         // if 2FA is enabled and session does not have 2FA code, redirect to 2FA page
        if (!user.two_factor_auth_email.enabled || !req.session.user.twoFactorAuthCode) {
          // create a 2FA code, save it to the user, and send it to the user's email and redirect to the 2FA page
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const expires = new Date();
          expires.setMinutes(expires.getMinutes() + 5);
          user.two_factor_auth_email.code = code;
          user.two_factor_auth_email.expires = expires;
          await user.save();
          // send the code to the user's email
          addNotification(userId, 'email', '2FA Code', `Your 2FA code is ${code}`, 'email');
          return res.redirect('/2fa-email ');
        }
  
        const groupId = user.group._id;
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
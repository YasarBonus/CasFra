const logger = require('../winston.js');
const db = require('../../db/database.js');

const notificator = require('../../services/notificationService.js');
const checkPermissions = require('../../middlewares/permissionMiddleware.js');
const addNotification = notificator.addNotification;

// reusable function to edit a user
function editUser(req, res) {
    const {
        id
    } = req.params; // Get the ID from the request body
    db.User.updateOne({
            _id: id
        }, {
            $set: req.body
        })
        .then((result) => {
            if (result.nModified === 0) {
                throw new Error('User not found');
            }
            res.json({
                success: true,
                id: id,
                status: 'updated'
            });
            logger.info('User updated:', id, req.body);
        })
        .catch((error) => {
            console.error('Error updating user:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
}

exports.editUser = editUser;
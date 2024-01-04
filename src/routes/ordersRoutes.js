const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const checkPermissions = require('../middlewares/permissionMiddleware.js');

// We need the following API router endpoints:
//
// Get all services that can be ordered (orderable = true and active = true)
// Permissions: none
// GET /available-services
// This will return all services that can be ordered

router.get('/available-services', async (req, res) => {
    try {
        const services = await db.Services.find({ orderable: true, active: true });
        res.json(services);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

//
// Get all services that can be ordered (orderable = true and active = true) of a specific type
// Permissions: none
// GET /available-services/:type
// This will return all services that can be ordered of the type :type
// The type needs to be the name of the type, not the id
// The type needs to be active = true
//
// Create a new order for a service for the current user
// Permissions: orderServices
// POST /service/:id
// This will create a new order for the service with the id :id
// The service needs to be orderable = true and active = true
// The order will be created for the current user
// The order will be created with:
// order.status = 'pending', order.completed = false
// creation_date = now, creation_ip = req.ip
// service: :id, user: req.user.id
//
// Get all orders for the current user
// Permissions: orderServices
// GET /
// This will return all orders with order.completed = false or order not older than 30 days
//
// Get the status of an order
// Permissions: orderServices
// GET /:id
// This will return the order.status and order.completed
//
// Cancel an order
// Permissions: manageOrders
// PUT /:id/cancel
// This will set:
// order.status.status to 'cancelled', order.status.date to now
// order.completed to true, order.completed_date to now

module.exports = router;
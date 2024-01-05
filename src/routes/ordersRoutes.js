const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');
const bodymen = require('bodymen');

const checkPermissions = require('../middlewares/permissionMiddleware.js');

// We need the following API router endpoints:
//
// Get all services that can be ordered (orderable = true and active = true)
// Permissions: none
// GET /available-services
// This will return all services that can be ordered

router.get('/available-services', async (req, res) => {
    try {
        const services = await db.Services.find({
            orderable: true,
            status: 'active'
        }).populate('type');
        // do not return orderable and active fields
        services.forEach((service) => {
            service.orderable = undefined;
            service.active = undefined;
            service.type.active = undefined;
        });
        res.json(services);
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

// Get all services that can be ordered (orderable = true and active = true) of a specific type
// Permissions: none
// GET /available-services/:type
// This will return all services that can be ordered of the type :type,
// filtered by :type = service.type.name
// The type needs to be the name of the type, not the id
// The type needs to be active = true

router.get('/available-services/:type', async (req, res) => {
    try {

        const services = await db.Services.find({
            orderable: true,
            active: true
        }).populate('type');

        // filter the services by type name
        const filteredServices = services.filter((service) => {
            return service.type.name === req.params.type;
        });

        // do not return orderable and active fields
        filteredServices.forEach((service) => {
            service.orderable = undefined;
            service.active = undefined;
            service.type.active = undefined;
        });
        res.json(filteredServices);
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

// Permissions: orderServices
// POST /service
// Create a new order for a service for the current user
// The user has to specify the service id or shortname, the interval, and the tenant (optional)
// If a tenant is specified, the tenant needs to be active = true, and in the user.tenancies
// The service needs to be orderable = true and active = true.
// The order will be created with:
// order.status.status = 'new', order.status.date = now
// creation_date = now, creation_ip = req.ip, creation_user = userId
// service: serviceId, internal: service.internal
// if a tenant is specified, the tenant will be set as tenant for the order,
// else if no tenant is specified, the user will be set as user for the order
// The order will be created with a random order number
// The order number will be unique
// The order number will be 10 characters long

router.post('/service', bodymen.middleware({
    service: db.Services.schema
}), async (req, res) => {
    const userId = req.session.user.userId;
    const {
        service,
        interval,
        tenant
    } = req.body;

    try {
        const serviceData = await db.Services.findOne({
            $or: [{
                    _id: service
                },
                {
                    shortname: service
                }
            ]
        });
        if (!serviceData) {
            res.status(404).json({
                message: 'Service not found'
            });
            return;
        }
        if (!serviceData.orderable || !serviceData.active) {
            res.status(400).json({
                message: 'Service not orderable'
            });
            return;
        }

        let tenantData;
        if (tenant) {
            tenantData = await db.Tenancies.findOne({
                _id: tenant,
                active: true,
            });
            if (!tenantData) {
                res.status(404).json({
                    message: 'Tenant not found'
                });
                return;
            }
        }

        const orderNumber = Math.random().toString(36).substr(2, 10);
        const order = new db.ServicesOrders({
            order_number: orderNumber,
            user: tenantData ? undefined : userId,
            tenant: tenantData ? tenantData._id : undefined,
            service: serviceData._id,
            creation_date: Date.now(),
            creation_ip: req.ip,
            creation_user: userId,
            status: {
                status: 'new',
                date: Date.now(),
            },
            completed: false,
        });
        await order.save();
        res.json(order);
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});




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
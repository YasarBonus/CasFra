const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');
const bodymen = require('bodymen');

const checkPermissions = require('../middlewares/permissionMiddleware.js');

// We need the following API router endpoints:

// Get all services that can be ordered (orderable = true and active = true)
// Permissions: none
// GET /available-services
// This will return all services that can be ordered

router.get('/available-services', async (req, res) => {
    try {
        const services = await db.Services.find({
            status: 'active'
        }).populate('type');
        // do not return orderable and active fields
        services.forEach((service) => {
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

router.post('/place', checkPermissions('orderServices'), bodymen.middleware({
    service: db.Services.schema
}), async (req, res) => {
    const userId = req.session.user.userId;
    const {
        service,
        service_id,
        interval,
        tenant_id
    } = req.body;

    try {
        const serviceData = await db.Services.findOne({
            $or: [{
                    _id: service_id
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
        if (!serviceData.orderable || !serviceData.status === 'active') {
            res.status(400).json({
                message: 'Service not orderable'
            });
            return;
        }

        let tenantData;
        if (tenant_id) {
            tenantData = await db.Tenancies.findOne({
                _id: tenant_id,
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
            interval: interval,
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
// GET /user
// This will return all orders with order.completed = false.
// if completed = true, completed_date needs to be younger than 30 days
// The orders will be sorted by order.creation_date descending

router.get('/user', checkPermissions('orderServices'), async (req, res) => {
    const userId = req.session.user.userId;
    try {
        const orders = await db.ServicesOrders.find({
            user: userId,
            completed: false
        })
        .sort({
            creation_date: -1
        });
        res.json(orders);
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

// Get all orders for the current tenant
// Permissions: orderServices
// GET /
// This will return all orders with order.completed = false.
// if completed = true, completed_date needs to be younger than 30 days
// The orders will be sorted by order.creation_date descending

router.get('/tenant', checkPermissions('orderServices'), async (req, res) => {
    const userId = req.session.user.userId;
    const userTenant = req.session.user.tenancy;
    try {
        const orders = await db.ServicesOrders.find({
            tenant: userTenant,
            completed: false
        })
        .sort({
            creation_date: -1
        });
        res.json(orders);
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
} );

router.get('/', checkPermissions('orderServices'), async (req, res) => {
    const userId = req.session.user.userId;
    const userTenant = req.session.user.tenancy;

    try {
        // find all orders that belong to the user or the tenant
        const orders = await db.ServicesOrders.find({
            $or: [{
                    user: userId
                },
                {
                    tenant: userTenant
                }
            ]
        })
        .sort({
            creation_date: -1
        }).populate('service').populate('tenant').populate('user');
        if (!orders) {
            res.status(404).json({
                message: 'Order not found'
            });
            return;
        }
        res.json(orders);
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

// Super: Get all orders for all tenants and users
// Permissions: manageOrders
// GET /super
// This will return all orders.
// The orders will be sorted by order.creation_date descending.
// The page size will be 50 orders per page.
// The page number will be specified in the query parameter page.
// The page number will be 1-based.
// The response will contain the following headers:
// X-Page-Size: the page size
// X-Page-Number: the page number
// X-Total-Count: the total number of orders
// X-Total-Pages: the total number of pages
// If the page number is invalid, the endpoint will return a 404 error.

router.get('/super', checkPermissions('manageOrders'), async (req, res) => {
    const pageSize = 5;
    const pageNumber = req.query.page;
    const skip = pageSize * (pageNumber - 1);

    try {
        const orders = await db.ServicesOrders.find()
        .sort({
            creation_date: -1
        }).populate('service').populate('tenant').populate('user').skip(skip).limit(pageSize);
        if (!orders) {
            res.status(404).json({
                message: 'Order not found'
            });
            return;
        }
        const count = await db.ServicesOrders.countDocuments();
        const pages = Math.ceil(count / pageSize);
        res.set('X-Page-Size', pageSize);
        res.set('X-Page-Number', pageNumber);
        res.set('X-Total-Count', count);
        res.set('X-Total-Pages', pages);
        res.json(orders);
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

// Cancel an order
// Permissions: manageOrders
// PUT /:id/cancel
// This will set:
// order.status.status to 'cancelled', order.status.date to now
// order.completed to true, order.completed_date to now

// Get the details of an order
// Permissions: orderServices
// GET /:id
// Check if the order belongs to the tenant or the user
// This will return the details of the order with the id :id

router.get('/:id', checkPermissions('orderServices'), async (req, res) => {
    const userId = req.session.user.userId;
    const orderId = req.params.id;
    const userTenant = req.session.user.tenancy;

    try {
        const order = await db.ServicesOrders.findOne({
            _id: orderId,
            $or: [{
                    user: userId
                },
                {
                    tenant: userTenant
                }
            ]
        }).populate('service').populate('tenant').populate('user');
        if (!order) {
            res.status(404).json({
                message: 'Order not found'
            });
            return;
        }
        res.json(order);
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;
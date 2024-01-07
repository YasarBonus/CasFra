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
});

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
// This will return all orders with pagination for all tenants and users

router.get('/super', checkPermissions('manageOrders'), async (req, res) => {
    try {
        console.log('Query:', req.query);
        const draw = parseInt(req.query.draw);
        const start = parseInt(req.query.start);
        const length = parseInt(req.query.length);
        const search = req.query.search;

        // Erstellen Sie eine Liste der Spaltennamen
        const columns = ['order_number', 'status', 'user', 'tenant', 'creation_date'];

        // Erstellen Sie die Sortieroptionen
        const sort = {};
        if (req.query.order) {
            req.query.order.forEach(order => {
                const columnName = columns[order.column];
                sort[columnName] = order.dir === 'asc' ? 1 : -1;
            });
        }

        // Suchen Sie zuerst in der User-Sammlung
        const users = await db.User.find({
            username: {
                $regex: search,
                $options: 'i'
            }
        });

        const tenants = await db.Tenancies.find({
            name: {
                $regex: search,
                $options: 'i'
            }
        });

        // Extrahieren Sie die IDs der gefundenen Benutzer
        const userIds = users.map(user => user._id);

        const searchQuery = {
            $or: [{
                    order_number: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    user: {
                        $in: userIds // Verwenden Sie die IDs der gefundenen Benutzer
                    }
                },
                {
                    tenant: {
                        $in: tenants.map(tenant => tenant._id) // Verwenden Sie die IDs der gefundenen Benutzer
                    }
                },
            ],
        };

        console.log('SearchQuery:', searchQuery);

        console.log('Sort:', sort);
        const orders = await db.ServicesOrders.find(searchQuery)
            .populate('service')
            .populate('tenant')
            .populate('user')
            .skip(start)
            .limit(length)
            .sort(sort)


        const totalOrders = await db.ServicesOrders.countDocuments(searchQuery);
        console.log('TotalOrders:', totalOrders);
        console.log('Amount of filtered Orders:', orders.length);


        res.send({
            draw: draw,
            recordsTotal: totalOrders,
            recordsFiltered: totalOrders,
            search: search,
            data: orders.map(order => ({
                _id: order._id,
                order_number: order.order_number,
                status: order.status,
                user: order.user,
                tenant: order.tenant,
                creation_date: order.creation_date
            })),
        });
    } catch (err) {
        res.status(500).send({
            error: 'An error occurred while retrieving orders: ' + err
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
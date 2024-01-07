const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');
const bodymen = require('bodymen');
const mongoose = require('mongoose');

const checkPermissions = require('../middlewares/permissionMiddleware.js');

router.get('/super', checkPermissions('manageTasks'), async (req, res) => {
    try {
        console.log('Query:', req.query);
        const draw = parseInt(req.query.draw);
        const start = parseInt(req.query.start);
        const length = parseInt(req.query.length);
        const search = req.query.search;

        // Create a list of column names
        const columns = ['id', 'status', 'user', 'tenant', 'creation_date'];

        // Create the sort options
        const sort = {};
        if (req.query.order) {
            req.query.order.forEach(order => {
                const columnName = columns[order.column];
                sort[columnName] = order.dir === 'asc' ? 1 : -1;
            });
        }

        // Search in the User collection first
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

        // Extract the IDs of the found users
        const userIds = users.map(user => user._id);

        const searchQuery = {
            $or: [{
                    name: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    id: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    user: {
                        $in: userIds // Use the IDs of the found users
                    }
                },
                {
                    tenant: {
                        $in: tenants.map(tenant => tenant._id) // Use the IDs of the found users
                    }
                },
            ],
        };

        console.log('SearchQuery:', searchQuery);

        console.log('Sort:', sort);
        const tasks = await db.Tasks.find(searchQuery)
            .populate('user')
            .populate('tenant')
            .populate('service')
            .populate('order')
            .skip(start)
            .limit(length)
            .sort(sort)


        const totalTasks = await db.Tasks.countDocuments(searchQuery);
        console.log('TotalTasks:', totalTasks);
        console.log('Amount of filtered Tasks:', tasks.length);


        res.send({
            draw: draw,
            recordsTotal: totalTasks,
            recordsFiltered: totalTasks,
            search: search,
            data: tasks.map(task => ({
                _id: task._id,
                name: task.name,
                status: task.status,
                user: task.user,
                tenant: task.tenant,
                date: task.date,
                logs: task.logs,
            })),
        });
    } catch (err) {
        res.status(500).send({
            error: 'An error occurred while retrieving tasks: ' + err
        });
    }
});

module.exports = router;
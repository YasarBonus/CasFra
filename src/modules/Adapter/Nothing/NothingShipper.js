const mongoose = require('mongoose');
const db = require('../../../db/database.js');

const logger = require('../../winston.js');


async function shipNothing(orderId) {

    const ServicesOrders = mongoose.model('ServicesOrders');
    const order = await ServicesOrders.findOne({ _id: orderId });
    if (order) {
        order.status.status = 'delivered';
        order.status.date = Date.now();
        order.completed = true;
        order.logs.push({ message: 'shipNothing: Order delivered', level: 'info', date: Date.now() });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await order.save();
        logger.info(`shipNothing: Order ${order._id} shipped`);
    } else {
        logger.error(`shipNothing: Order ${orderId} not found`);
    }

    // close the database connection
    mongoose.connection.close();
}

process.on('message', (message) => {
    const run = shipNothing(message.orderId);

    run.then(() => {
        process.exit(0, 'success');
    }
    ).catch((err) => {
        console.log(err);
        process.exit(1, 'error:' + err);
    });
} );


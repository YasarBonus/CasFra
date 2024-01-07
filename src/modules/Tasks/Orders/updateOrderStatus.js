const mongoose = require('mongoose');
const db = require('../../../db/database.js');

const logger = require('../../winston.js');

// function to update the order status
async function updateOrderStatus(orderId, status) {
    const ServicesOrders = mongoose.model('ServicesOrders');
    const order = await ServicesOrders.findOne({ _id: orderId });
    if (order) {
        order.status.status = status;
        order.status.date = Date.now();
        order.logs.push({ message: 'Order status changed to ' + status, level: 'info', date: Date.now() });
        await order.save();
        logger.info(`updateOrderStatus: Order ${order._id} updated to ${status}`);
    } else {
        logger.error(`updateOrderStatus: Order ${orderId} not found`);
    }
}

// export the function to be used in other modules
module.exports = updateOrderStatus;
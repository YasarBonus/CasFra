const mongoose = require('mongoose');
const db = require('../../../db/database.js');

// function to update the order status
async function updateOrderStatus(orderId, status) {
    const ServicesOrders = mongoose.model('ServicesOrders');
    const order = await ServicesOrders.findOne({ _id: orderId });
    if (order) {
        order.status.status = status;
        order.status.date = Date.now();
        await order.save();
        console.log(`Order ${orderId} updated to ${status}`);
    } else {
        console.log(`Order ${orderId} not found`);
    }
}

// export the function to be used in other modules
module.exports = updateOrderStatus;
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
        console.log(`Order ${orderId} status changed to ${status}`);
    } else {
        console.log(`Order ${orderId} not found`);
    }
}

process.on('message', (message) => {
    const run = updateOrderStatus(message.orderId, message.status);

    run.then(() => {
        process.exit(0, 'success');
    }
    ).catch((err) => {
        console.log(err);
        process.exit(1, 'error:' + err);
    });
} );
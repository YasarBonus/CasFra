const mongoose = require('mongoose');
const db = require('../../../db/database.js');

async function shipNothing(orderId) {

    const ServicesOrders = mongoose.model('ServicesOrders');
    const order = await ServicesOrders.findOne({ _id: orderId });
    if (order) {
        order.status.status = 'confirmed';
        order.status.date = Date.now();
        await order.save();
        console.log(`Order ${orderId} processed`);
    } else {
        console.log(`Order ${orderId} not found`);
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


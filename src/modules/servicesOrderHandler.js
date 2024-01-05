const cron = require('node-cron');
const mongoose = require('mongoose');
const db = require('../db/database.js');

// Aufgabe, die alle 5 Sekunden ausgeführt wird
cron.schedule('*/5 * * * * *', () => {
    processOrders();
  console.log('Diese Aufgabe wird alle 5 Sekunden ausgeführt');
});


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

// confirm orders

async function processOrders() {
    // connect to the database and populate the models, then:
    const ServicesOrders = mongoose.model('ServicesOrders');

    // filter the orders by completed != true
    const uncompletedOrders = await ServicesOrders.find({ completed: false });

    // get all orders and populate the user and status fields
    const orders = await ServicesOrders.find({ completed: false }).populate('user').populate('status');

    
    const newOrders = orders.filter(order => order.status.status === 'new' && order.creation_date < Date.now() - 30);
    newOrders.forEach(async (order) => {
        updateOrderStatus(order._id, 'awaitingConfirmation');
    });

    const awaitingConfirmationOrders = orders.filter(order => order.status.status === 'awaitingConfirmation' && order.status.date < Date.now() - 10);
    awaitingConfirmationOrders.forEach(async (order) => {
        updateOrderStatus(order._id, 'confirming');
    });

    const confirmingOrders = orders.filter(order => order.status.status === 'confirming' && order.status.date < Date.now() - 10);
    confirmingOrders.forEach(async (order) => {
        updateOrderStatus(order._id, 'confirmed');
    });

    const confirmedOrders = orders.filter(order => order.status.status === 'confirmed' && order.status.date < Date.now() - 10);
    confirmedOrders.forEach(async (order) => {
        updateOrderStatus(order._id, 'new');
    });
}



module.exports = {
    processOrders,
};
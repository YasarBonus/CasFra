const mongoose = require('mongoose');
const db = require('../../db/database.js');

const { fork } = require('child_process');
const async = require('async');


// Maximale Anzahl von gleichzeitig laufenden Prozessen
const MAX_PROCESSES = 1;

// Warteschlange mit einer Begrenzung von maximal gleichzeitig laufenden Prozessen
const queue = async.queue((task, callback) => {
    const process = fork('./src/modules/Orders/updateOrderStatus.js');
    console.log('Spawned child process:' + process.pid);
    process.send({ orderId: task.order._id, status: task.status });

    process.on('exit', function (code, signal) {
        console.log('child process exited with ' +
                    `code ${code} and signal ${signal}`);
        callback();
    });
}, MAX_PROCESSES);

async function updateOrderStatus(order, status) {
    queue.push({ order: order, status: status });
}

// function to process uncompleted orders and decide what to do with them
async function processOrders() {
    // connect to the database and populate the models, then:
    const ServicesOrders = mongoose.model('ServicesOrders');

    // filter the orders by completed != true
    const uncompletedOrders = await ServicesOrders.find({ completed: false });

    // get all orders and populate the user and status fields
    const orders = await ServicesOrders.find({ completed: false }).populate('user').populate('status');

    
    const newOrders = orders.filter(order => order.status.status === 'new' && order.creation_date < Date.now() - 30);
    newOrders.forEach(async (order) => {
        updateOrderStatus(order, 'awaitingConfirmation'); 
    });

    const awaitingConfirmationOrders = orders.filter(order => order.status.status === 'awaitingConfirmation' && order.status.date < Date.now() - 10);
    awaitingConfirmationOrders.forEach(async (order) => {
        updateOrderStatus(order, 'confirming'); 

    });

    const confirmingOrders = orders.filter(order => order.status.status === 'confirming' && order.status.date < Date.now() - 10);
    confirmingOrders.forEach(async (order) => {
        updateOrderStatus(order, 'confirmed'); 

        
    });

    const confirmedOrders = orders.filter(order => order.status.status === 'confirmed' && order.status.date < Date.now() - 10);
    confirmedOrders.forEach(async (order) => {
        updateOrderStatus(order, 'new'); 

    });
}

module.exports = {
    processOrders,
};
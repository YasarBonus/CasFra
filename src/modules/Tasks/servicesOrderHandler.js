const mongoose = require('mongoose');
const db = require('../../db/database.js');

const { fork } = require('child_process');
const async = require('async');

const dotenv = require('dotenv');

// load environment variables from .env file
dotenv.config();

// get the maximum number of processes from the environment variables
const MAX_PROCESSES_UPDATE_ORDER_STATUS = process.env.MAX_PROCESSES_UPDATE_ORDER_STATUS || 1;
const MAX_PROCESSES_SHIP_ORDERS = process.env.MAX_PROCESSES_SHIP_ORDERS || 1;

async function updateOrderStatus(order, status) {
    const taskInfo = new db.Tasks({ name: 'updateOrderStatus', description: 'Update order status', user: order.user, tenant: order.tenant, date: Date.now(), status: 'queued', logs: [{ message: 'Task queued' , level: 'info', date: Date.now() }] });
    await taskInfo.save();

    // create the task
    const task = { order: order, status: status, taskInfo: taskInfo };

    // que the task
    await queueUpdateOrderStatus.push(task);
}

// order status queue
const queueUpdateOrderStatus = async.queue(async (task, callback) => {
    const process = fork('./src/modules/Tasks/Orders/updateOrderStatus.js', [], {
        detached: true,
    });
    // Speichern Sie die PID des Prozesses in der Datenbank
    task.taskInfo.pid = process.pid;
    await task.taskInfo.save();

    console.log('Spawned child process:' + process.pid);
    process.send({ orderId: task.order._id, status: task.status });

    process.on('exit', async (code, signal) => {
        // Aktualisieren Sie die Prozessinformationen in der Datenbank, wenn der Prozess beendet wird
        task.taskInfo.exitCode = code;
        task.taskInfo.exitSignal = signal;
        await task.taskInfo.save();
        console.log('child process exited with ' + `code ${code} and signal ${signal}`);
    });
}, MAX_PROCESSES_UPDATE_ORDER_STATUS);



// order shipping queue
const queueShipOrders = async.queue((task, callback) => {
    const process = fork('./src/modules/Adapter/Nothing/NothingShipper.js');
    console.log('Spawned child process:' + process.pid);
    process.send({ orderId: task.order._id, status: task.status });

    process.on('exit', function (code, signal) {
        console.log('child process exited with ' +
                    `code ${code} and signal ${signal}`);
        callback();
    });
}, MAX_PROCESSES_SHIP_ORDERS);


async function shipOrder(order, status) {
    queueShipOrders.push({ order: order, status: status });
}



// function to process uncompleted orders and decide what to do with them
async function processOrders() {
    // connect to the database and populate the models, then:
    const ServicesOrders = mongoose.model('ServicesOrders');

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
        updateOrderStatus(order, 'awaitingDelivery'); 

    });

    const awaitingDeliveryOrders = orders.filter(order => order.status.status === 'awaitingDelivery' && order.status.date < Date.now() - 10);
    awaitingDeliveryOrders.forEach(async (order) => {
        shipOrder(order._id); 
    });

    // Process confirmed orders

}

module.exports = {
    processOrders,
};
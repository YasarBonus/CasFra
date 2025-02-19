const mongoose = require('mongoose');
const db = require('../../db/database.js');

const { fork } = require('child_process');
const async = require('async');

logger = require('../winston.js');


const updateOrderStatus = require('./Orders/updateOrderStatus.js');

// load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

// get the maximum number of processes from the environment variables
const MAX_PROCESSES_SHIP_ORDERS = process.env.MAX_PROCESSES_SHIP_ORDERS || 1;

async function shipOrder(order, status) {
    const orderDetails = await db.ServicesOrders.findOne({ _id: order });
    console.log('HIIIIII' + orderDetails);

    const isOrderInQueue = queueShipOrders.workersList().some(worker => worker.data.order._id === order._id);

    if (!isOrderInQueue) {

        const taskInfo = new db.Tasks({ name: 'shipOrder', description: 'Ship order', user: orderDetails.user, tenant: orderDetails.tenant, order: orderDetails._id, date: Date.now(), status: { status: 'starting', date: Date.now() },  logs: ({ message: 'Starting task' , level: 'info', date: Date.now() }) });
        await taskInfo.save();

        // create the task
        const task = { order: order, status: status, taskInfo: taskInfo };

        await new Promise(resolve => setTimeout(resolve, 1000));
        await queueShipOrders.push(task);
        logger.info(`shipOrder: Order ${order._id} queued`);
    } else {
        logger.warn(`shipOrder: Order ${order._id} already in queue`);
    }
}

// order shipping queue
const queueShipOrders = async.queue(async (task, callback) => {
    Object.assign(task.taskInfo, {
        status: { status: 'starting', date: Date.now()},
        completed: false,
        date: Date.now(),
    });
    task.taskInfo.logs.push({ message: 'Task starting' , level: 'info', date: Date.now() });
    await task.taskInfo.save();

    const process = fork('./src/modules/Adapter/Nothing/NothingShipper.js', [], {
        detached: true,
    });

    Object.assign(task.taskInfo, {
        status: { status: 'running', date: Date.now()},
        completed: false,
        date: Date.now(),
        pid: process.pid,
    });
    task.taskInfo.logs.push({ message: 'Task running' , level: 'info', date: Date.now() });
    await task.taskInfo.save();
    

    process.send({ orderId: task.order._id, status: task.status });

    process.on('exit', async (code, signal) => {
        // Aktualisieren Sie die Prozessinformationen in der Datenbank, wenn der Prozess beendet wird
        Object.assign(task.taskInfo, {
            exitCode: code,
            exitSignal: signal,
            status: { status: 'completed', date: Date.now()},
            completed: true,
            date: Date.now(),
        });
        task.taskInfo.logs.push({ message: 'Task completed' , level: 'info', date: Date.now() });
        await task.taskInfo.save();
    });
}, MAX_PROCESSES_SHIP_ORDERS);






// function to process uncompleted orders and decide what to do with them
async function processOrders() {
    // connect to the database and populate the models, then:
    const ServicesOrders = mongoose.model('ServicesOrders');

    // get all orders and populate the user and status fields
    const orders = await ServicesOrders.find({ completed: false }).populate('user').populate('status');

    
    const newOrders = orders.filter(order => order.status.status === 'new' && order.creation_date < Date.now() - 30);
    newOrders.forEach(async (order) => {
        updateOrderStatus(order, 'awaitingDelivery'); 
    });

    const awaitingConfirmationOrders = orders.filter(order => order.status.status === 'delivered' && order.status.date < Date.now() - 10);
    awaitingConfirmationOrders.forEach(async (order) => {
        updateOrderStatus(order, 'confirming'); 

    });
//
    //const confirmingOrders = orders.filter(order => order.status.status === 'confirming' && order.status.date < Date.now() - 10);
    //confirmingOrders.forEach(async (order) => {
    //    updateOrderStatus(order, 'confirmed'); 
//
    //    
    //});
//
    //const confirmedOrders = orders.filter(order => order.status.status === 'confirmed' && order.status.date < Date.now() - 10);
    //confirmedOrders.forEach(async (order) => {
    //    updateOrderStatus(order, 'awaitingDelivery'); 
//
    //});

    const awaitingDeliveryOrders = orders.filter(order => order.status.status === 'awaitingDelivery' && order.status.date < Date.now() - 10);
    awaitingDeliveryOrders.forEach(async (order) => {
        shipOrder(order._id); 
    });

    // Process confirmed orders

}

module.exports = {
    processOrders,
};
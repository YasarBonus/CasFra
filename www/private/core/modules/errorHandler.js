const email = require('./emailService.js');
const fs = require('fs');

function errorHandler(err, req, res, next) {
    // Handle the error here
    logError(err, req, res, next);
    
    const currentDateTime = new Date();

    try {
        // Send an appropriate response to the client if the error occurred in express
        res.status(500).json({  code: res.statusCode, type: err.name, message: err.message, date: currentDateTime, stack: err.stack });
    } catch (error) {
    }

    // email.sendEmail('joshua@treudler.net', 'System Error', 'An error occurred: ' + err.message + '\n\n' + err.stack);
}

function logError(err, req, res, next) {
    
    // Handle the error here
    console.error('ERROR:', err);


    
    // Log error to file
    fs.appendFile('error.log', err.stack, function (error) {
        if (error) {
            console.error('Error logging error:', error);
        }
    });
}


module.exports = errorHandler;

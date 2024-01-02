const logger = require("./winston");

function errorHandler(err, req, res, next) {
    // Handle the error here
    logger.error(err.message);
    
    const currentDateTime = new Date();

    res.status(500).json({  code: res.statusCode, type: err.name, message: err.message, date: currentDateTime, stack: err.stack });

    // email.sendEmail('joshua@treudler.net', 'System Error', 'An error occurred: ' + err.message + '\n\n' + err.stack);
}

module.exports = errorHandler;

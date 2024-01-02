const email = require('./emailService.js');

// Error handler middleware
function errorHandler(err, req, res, next) {
    // Handle the error here
    console.error('ERROR:', err);
    
    // Send an appropriate response to the client
    res.status(500).json({  code: res.statusCode, type: err.name, message: err.message });
    email.sendEmail('joshua@treudler.net', 'System Error', 'An error occurred: ' + err.message + '\n\n' + err.stack);
}

module.exports = errorHandler;

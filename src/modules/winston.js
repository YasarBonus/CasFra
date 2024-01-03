// Desc: Winston logger

const Transport = require("winston-transport");
const { addNotification } = require('../services/notificationService.js');

class NotificationTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });
    // addNotification('6592e50e3e88dcf3e2da995d', 'email', info.level + ': ' + info.message, info.timestamp + ' # ' + info.level + ': ' + info.message, "email");
    callback();
  }
}

const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "warn" }),
    new winston.transports.File({ filename: "app.log" }),
    new winston.transports.Console({ level: "info" }),
    new NotificationTransport( { level: "warn" }),
  ],
});

//logger.info("What rolls down stairs");//

//logger.warn("alone or in pairs");//

//logger.error("and over your neighbor's dog?");//

//logger.debug("What's great for a snack");//

//logger.verbose("And fits on your back?");//

//logger.silly("It's log, log, log");//

//logger.log({
//    level: "info",
//    message: "Pass an object and this works",
//});

module.exports = logger;
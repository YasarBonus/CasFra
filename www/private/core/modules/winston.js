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
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

logger.info("What rolls down stairs");

logger.warn("alone or in pairs");

logger.error("and over your neighbor's dog?");

logger.debug("What's great for a snack");

logger.verbose("And fits on your back?");

logger.silly("It's log, log, log");

logger.log({
    level: "info",
    message: "Pass an object and this works",
});

module.exports = logger;
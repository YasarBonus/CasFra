const email = require('./emailService.js');
const db = require('../database/database.js');


// Function to hand over notifications to the different handlers
// This function will check the transporter types and call the appropriate handler

async function addNotification(userId, type, subject, message, transporter) {
  try {
    if (transporter === 'email') {
      // Call the addNotificationEmail function
      await addNotificationEmail(userId, type, subject, message);
    } else {
      console.error('Error adding notification: Invalid transporter type');
    }
  } catch (error) {
    console.error('Error adding notification:', error);
  }
}


async function addNotificationEmail(userId, type, subject, message) {
  try {
    // Create a new NotificationEmail object
    const notificationEmail = await db.NotificationEmails.create({
      userId,
      type,
      subject,
      message,
      emailDelivered: false,
      emailDeliveredDate: null,
      emailDeliveredTo: null,
    });

    // Add the notification email to the queue
    await db.NotificationEmailQueue.create({
      notificationId: notificationEmail._id
    });
  } catch (error) {
    console.error('Error adding notification email:', error);
  }
}

async function sendNotificationEmails() {
  try {
    // Get the first entry from the db.NotificationEmailQueue
    const notificationEmailQueue = await db.NotificationEmailQueue.findOne().sort({
      _id: 1
    });

    if (notificationEmailQueue) {
      // Get the NotificationEmail by its id
      const notificationEmail = await db.NotificationEmails.findById(notificationEmailQueue.notificationId);

      // Get the user by its id
      const user = await db.User.findById(notificationEmail.userId);

      // Send the email to the user's email address
      await email.sendEmail(user.email, notificationEmail.subject, notificationEmail.message);

      // Set the NotificationEmail emailDelivered to true and emailDeliveredDate to current date and emailDeliveredTo to the user's email address
      notificationEmail.emailDelivered = true;
      notificationEmail.emailDeliveredDate = new Date();
      notificationEmail.emailDeliveredTo = user.email;

      // Save the NotificationEmail
      await notificationEmail.save();

      // Delete the NotificationEmail from the db.NotificationEmailQueue
      await db.NotificationEmailQueue.deleteOne({
        notificationId: notificationEmail._id
      });

      // Call the function again to send the next NotificationEmail
      setTimeout(sendNotificationEmails, 1000);
    } else {
      // Sleep for 5 seconds
      await sleep(5000);

      // Call the function again
      sendNotificationEmails();
    }
  } catch (error) {
    console.error('Error sending notification emails:', error);
    // Handle the error here
  }
}

// sleep function
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

sendNotificationEmails();

module.exports = {
    addNotification
    };
    
// Path: www/private/core/modules/emailService.js
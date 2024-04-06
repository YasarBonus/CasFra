const email = require('./emailService.js');
const db = require('../db/database.js');
const logger = require('../modules/winston.js');

// Function to hand over notifications to the different handlers
// This function will check the transporter types and call the appropriate handler

// async function addNotification(userId, type, subject, message, transporter) {
//   try {
//     if (transporter === 'email') {
//       // Call the addNotificationEmail function
//       await addNotificationEmail(userId, type, subject, message);
//     } else {
//       console.error('Error adding notification: Invalid transporter type');
//     }
//   } catch (error) {
//     console.error('Error adding notification:', error);
//   }
// }

async function addNotification(userId, type, subject, message, transporter) {
  try {
    if (transporter == 'email') {
      // get the user email from database and send the email
      const user = await db.User.findById(userId);
      email.sendEmail(user.email, subject, message);
    } else {
      // get the user email from database and send the email
      const user = await db.User.findById(userId);
      email.sendEmail(user.email, subject, message);
    }
  } catch (error) {
    console.error('Error adding notification:', error);
  }
}

addNotification('65963403b3f747a775596d9d', 'info', 'Email Notifications OK', 'Email Notifications are working', 'email');

// get the userId for Joshua2504 from the database and Call the addNotification function with the userId, transporter type, subject, message and transporter

//   addNotification('660feaf6b1ec63388ceebd4b', 'email', 'Test subject', 'Test message', 'email');
// 
// 
// async function addNotificationEmail(userId, type, subject, message) {
//   try {
//     // Create a new NotificationEmail object
//     const notificationEmail = await db.NotificationEmails.create({
//       userId,
//       type,
//       subject,
//       message,
//       emailDelivered: false,
//       emailDeliveredDate: null,
//       emailDeliveredTo: null,
//     });
// 
//     // Add the notification email to the queue
//     await db.NotificationEmailQueue.create({
//       notificationId: notificationEmail._id
//       });
//       console.log('Notification added to queue');
//   } catch (error) {
//     console.error('Error adding notification email:', error);
//   }
// }

async function sendNotificationEmails() {
  console.log('Sending notification emails');
  try {
    // Get the first entry from the db.NotificationEmailQueue
    const notificationEmailQueue = await db.NotificationEmailQueue.findOne().sort({
      _id: 1
    });
    console.log('notification to process:', notificationEmailQueue);

    if (notificationEmailQueue) {
      // Get the NotificationEmail by its id
      const notificationEmail = await db.NotificationEmails.findById(notificationEmailQueue.notificationId);
      console.log('notificationEmail found:', notificationEmail);

      // Get the user by its id
      const user = await db.User.findById(notificationEmail.userId);
      console.log('user ID is', user[0], ', found:', user);

      // Get the primary email address of the user
      const primaryEmail = user.emails.email;
      console.log('primaryEmail is', primaryEmail);

      // Send the email to the user's primary email address
      email.sendEmail(primaryEmail, notificationEmail.subject, notificationEmail.message);
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

      console.log('Notification email sent');

      // Call the function again to send the next NotificationEmail
      setTimeout(sendNotificationEmails, 1000);
    } else {
      // Sleep for 5 seconds
      await sleep(5000);

      // Call the function again
      sendNotificationEmails();
    }
  } catch (error) {
    // logger.error(error);
    // Handle the error here
  }
}

// Function to sleep for a given number of milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// sendNotificationEmails();

module.exports = {
  addNotification,
};
    
// Path: www/private/core/modules/emailService.js
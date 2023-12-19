// emailService.js
const nodemailer = require('nodemailer');

function sendPasswordResetEmail(email, newPassword) {
  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'mail.behindthemars.de',
    port: 25,
    secure: false,
    auth: {
      user: 'system@treudler.net',
      pass: 'iongai5ge9Quah4Ya9leizaeMie5oo8equee4It1eiyuuz1Voi'
    }
  });

  // Define the email options
  const mailOptions = {
    from: 'system@treudler.net',
    to: email,
    subject: 'Password Reset',
    text: `Your new password is: ${newPassword}`
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending password reset email:', error);
    } else {
      console.log('Password reset email sent:', info.response);
    }
  });
}

module.exports = sendPasswordResetEmail;
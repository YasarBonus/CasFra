const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Reusable function to send a email
const sendEmail = (email, subject, text) => {
  const mailOptions = {
    from: "'" + process.env.SMTP_FROM_NAME + "'" + "<" + process.env.SMTP_FROM + ">",
    name: process.env.SMTP_FROM_NAME,
    replyTo: process.env.SMTP_REPLYTO,
    to: email,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// sendEmail('joshua@treudler.net', 'Test Email', 'This is a test email');

// Exportieren Sie die Funktionen, die Sie benötigen
module.exports = {
  sendEmail
};
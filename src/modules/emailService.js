const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.behindthemars.de',
  port: 587,
  secure: false,
  auth: {
    user: 'system@treudler.net',
    pass: 'iongai5ge9Quah4Ya9leizaeMie5oo8equee4It1eiyuuz1Voi'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Reusable function to send a email
const sendEmail = (email, subject, text) => {
  const mailOptions = {
    from: 'system@treudler.net',
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

// Exportieren Sie die Funktionen, die Sie benötigen
module.exports = {
  sendEmail
};
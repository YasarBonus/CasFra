const email = require('./emailService.js');
const db = require('../database/database.js');

// Function to check for unverified email addresses in the user database (User.emails)
// and start the verification process

async function checkUnverifiedEmails() {
    try {
        // Get all users with unverified email addresses
        const users = await db.User.find({
        'emails.is_confirmed': false
        });
    
        // Loop through the users
        for (const user of users) {
        // Loop through the user's emails
        for (const email of user.emails) {
            // Check if the email address is not confirmed and the confirmation code is expired
            if (!email.is_confirmed && email.confirmation_code_expires < new Date()) {
            // Start the email verification process
            await startEmailVerification(user._id, email.email);
            }
        }
        }
    } catch (error) {
        console.error('Error checking unverified emails:', error);
    }
}

// call the checkUnverifiedEmails function every 5 seconds
setInterval(checkUnverifiedEmails, 5000);
checkUnverifiedEmails();

// Function to start the email verification process:
// 1. Generate a random confirmation code and save it to the database (db.User.emails.confirmation_code)
// 2. Send an email to the user with a link to verify the email address and update the confirmation code sent date (db.User.emails.confirmation_code_sent)
// 3. Set the confirmation code expiration date (db.User.emails.confirmation_code_expires)
// 4. Set the email verification status to false (db.User.emails.is_confirmed)

async function startEmailVerification(userId, email) {
    try {
        // Generate a random confirmation code
        const confirmationCode = generateRandomString(50);
    
        // Save the confirmation code to the database
        await db.User.updateOne({
        _id: userId,
        'emails.email': email
        }, {
        $set: {
            'emails.$.confirmation_code': confirmationCode,
            'emails.$.confirmation_code_sent': new Date(),
            'emails.$.confirmation_code_expires': new Date(Date.now() + 24 * 60 * 60 * 1000),
            'emails.$.is_confirmed': false
        }
        });
    
        // Send the verification email
        await email.sendEmail(email, 'Email verification', `Please verify your email address by clicking the link below:<br><br><a href="http://localhost:3000/verify-email?code=${confirmationCode}">Verify email address</a>`);
    } catch (error) {
        console.error('Error starting email verification:', error);
    }
}

// Function to generate a random string with the specified length

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
}

// Function to check if the confirmation code is valid

async function checkEmailVerificationCode(confirmationCode) {
    try {
        // Get the user by the confirmation code
        const user = await db.User.findOne({
        'emails.confirmation_code': confirmationCode
        });
    
        // Check if the user exists
        if (user) {
        // Check if the confirmation code is expired
        const email = user.emails.find(email => email.confirmation_code === confirmationCode);
    
        if (email.confirmation_code_expires > new Date()) {
            // Set the email verification status to true
            await db.User.updateOne({
            _id: user._id,
            'emails.confirmation_code': confirmationCode
            }, {
            $set: {
                'emails.$.is_confirmed': true,
                'emails.$.confirmation_date': new Date()
            }
            });
    
            return true;
        } else {
            return false;
        }
        } else {
        return false;
        }
    } catch (error) {
        console.error('Error checking email verification code:', error);
        return false;
    }
}

module.exports = {
    checkUnverifiedEmails,
    checkEmailVerificationCode
};
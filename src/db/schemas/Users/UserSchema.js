const mongoose = require('mongoose');
const userEmailsSchema = require('./UserEmailsSchema');
const userPersonalDetailsSchema = require('./UserPersonalDetailsSchema');
const userPersonalAddressSchema = require('./UserPersonalAddressSchema');
const userStatusSchema = require('./UserStatusSchema');
const userRegistrationSchema = require('./UserRegistrationSchema');
const bcrypt = require('bcrypt');


// Define User schema
const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    nickname: {
      type: String,
      default: '',
      maxlength: 20
    },
    language: {
      type: String,
    ref: 'Language'
    },
    email: {
      type: String,
    },
    emails: userEmailsSchema,
    status: userStatusSchema,
    points: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserPoints'
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserGroup',
    },
    tenancies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Tenancies'
    },
    tenancy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenancies'
    },
    default_tenancy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenancies'
    },
    personal_details: userPersonalDetailsSchema,
    personal_address: userPersonalAddressSchema,
    priority: {
      type: Number,
      default: 0
    },
    last_login: {
      type: Date
    },
    last_login_ip: {
      type: String
    },
    registration: userRegistrationSchema,
  });
  
  const User = mongoose.model('User', UserSchema);

  module.exports = User;

    // function to set a new password for a user based on the user Id

    async function setPassword(userId, newPassword) {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  

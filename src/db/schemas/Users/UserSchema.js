const mongoose = require('mongoose');
const userEmailsSchema = require('./UserEmailsSchema');
const userPersonalDetailsSchema = require('./UserPersonalDetailsSchema');
const userPersonalAddressSchema = require('./UserPersonalAddressSchema');
const userRegistrationSchema = require('./UserRegistrationSchema');
const UserGroup = require('./UserGroupSchema');
const bcrypt = require('bcrypt');

const userStatusSchema = new mongoose.Schema({
  active: {
      type: Boolean,
      default: false,
      required: true
  },
  banned: {
      type: Boolean,
      default: false
  },
  online: {
      type: Boolean,
      default: false
  },
  last_seen: {
      type: Date,
      maxlength: 50
  },
});

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



// add a default admin user to the database
const defaultAdminUser = new User({
    username: 'admin',
    email: 'system@treudler.net',
    password: 'password',
    emails: {
      email: 'joshua@treudler.net',
      is_primary: true,
      is_confirmed: true
    },
    status: {
      active: true
    },
    group: '660fe60fcb34849e14187284'
});

// check if the default admin user exists in the database
// if not, add it
// if yes, update it

async function addDefaultAdminUser() {
  try {
    const user = await User.findOne({ username: 'admin' });
    if (!user) {
      await defaultAdminUser.save();
      console.log('Default admin user added');
    } else {
      user.email = 'joshua@treudler.net';
      // user.password = 'password';
      user.emails = {
        email: 'joshua@treudler.net',
        is_primary: true,
        is_confirmed: true
      };
      user.status = {
        active: true
      };
      user.group = '660fe60fcb34849e14187284';
      await user.save();
      console.log('Default admin user updated');
    }
  } catch (err) {
    console.log(err);
  }
}

addDefaultAdminUser();

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
  
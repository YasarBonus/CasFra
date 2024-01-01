const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');
const userPersonalDetailsSchema = require('./UserPersonalDetailsSchema');
const userPersonalAdressesSchema = require('./UserPersonalAddressesSchema');



// Define User schema
const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 10,
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserGroup'
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/
    },
    language: String,
    nickname: {
      type: String,
      default: '',
      maxlength: 20
    },
    priority: {
      type: Number,
      default: generateRandomPriority()
    },
    active: {
      type: Boolean,
      default: false,
      required: true
    },
    banned: {
      type: Boolean,
      default: false
    },
    registrationKey: String,
    registrationDate: Date,
    registrationIp: String,
    registrationVerificationCode: String,
    registrationVerificationCodeExpiry: Date,
    lastLoginDate: Date,
    lastLoginIp: String,
    tenancies: [String],
    tenancy: String,
    personalDetails: userPersonalDetailsSchema,
    personalAddresses: userPersonalAdressesSchema,
  });
  
  const User = mongoose.model('User', UserSchema);

  module.exports = User;
const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');
const userPersonalDetailsSchema = require('./UserPersonalDetailsSchema');
const userPersonalAddressesSchema = require('./UserPersonalAddressesSchema');
const userEmailsSchema = require('./UserEmailsSchema');
const userStatusSchema = require('./UserStatusSchema');
const userRegistrationSchema = require('./UserRegistrationSchema');

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
    emails: userEmailsSchema,
    status: userStatusSchema,
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    groupId: { // TODO: remove this field
      type: mongoose.Schema.Types.ObjectId
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
    personalDetails: userPersonalDetailsSchema,
    personalAddresses: userPersonalAddressesSchema,
    priority: {
      type: Number,
      default: 0
    },
    active: { // TODO: remove this field
      type: Boolean,
      default: false,
      required: true
    },
    banned: { // TODO: remove this field
      type: Boolean,
      default: false
    },
    registrationKey: String, // TODO: remove this field
    registrationDate: Date, // TODO: remove this field
    registrationIp: String, // TODO: remove this field
    registrationVerificationCode: String, // TODO: remove this field
    registrationVerificationCodeExpiry: Date, // TODO: remove this field
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
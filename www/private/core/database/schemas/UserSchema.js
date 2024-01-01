const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');
const userPersonalDetailsSchema = require('./UserPersonalDetailsSchema');
const userPersonalAdressesSchema = require('./UserPersonalAddressesSchema');
const userEmailsSchema = require('./UserEmailsSchema');
const userStatusSchema = require('./UserStatusSchema');

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
      ref: 'Tenancie'
    },
    tenancy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenancie'
    },
    personalDetails: userPersonalDetailsSchema,
    personalAddresses: userPersonalAdressesSchema,
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
    registrationKey: String,
    registrationDate: Date,
    registrationIp: String,
    registrationVerificationCode: String,
    registrationVerificationCodeExpiry: Date,
    lastLoginDate: Date,
    lastLoginIp: String,

  });
  
  const User = mongoose.model('User', UserSchema);

  module.exports = User;

const mongoose = require('mongoose');
const generateRandomPriority = require('../../../utils/generateRandomPriority');


// Define UserGroup schema
const userGroupSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    permissions: {
      type: [String]
    },
    priority: {
      type: Number,
      default: generateRandomPriority()
    },
    tenancies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Tenancies'
    },
    active: {
      type: Boolean,
      default: true
    },
    addedDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedDate: Date,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    default: {
      type: Boolean,
      default: false
    }
  });
  
  const UserGroup = mongoose.model('UserGroup', userGroupSchema);

  const userAdminGroup = new UserGroup({
    name: 'Admin',
    permissions: ['authenticate', 'viewDashboard', 'manageTenancies', 'manageRegistrationKeys', 'manageUsers', 'manageShortLinks', 'manageCasinos',
      'manageLinks', 'manageProvider', 'managePaymentMethods', 'manageAccount', 'manageRegistrationKeys',
      'manageSessions', 'manageImages', 'manageImagesCategories', 'manageUsers', 'manageProxmoxServers', 'manageCasinoWishListBot', 'manageServices'
    ]
  });
  
  const userOperatorGroup = new UserGroup({
    name: 'Operator',
    permissions: ['authenticate', 'viewDashboard', 'manageCasinos', 'manageLinks', 'manageProvider',
      'managePaymentMethods', 'manageAccount'
    ]
  });
  
  const userUserGroup = new UserGroup({
    name: 'User',
    permissions: ['authenticate', 'viewDashboard', 'manageAccount']
  });
  
  const saveDefaultUserDatabaseData = async () => {
    try {
      const adminGroup = await UserGroup.findOne({
        name: 'Admin'
      });
      const userGroup = await UserGroup.findOne({
        name: 'User'
      });
      const operatorGroup = await UserGroup.findOne({
        name: 'Operator'
      });
  
      const promises = [];
  
      if (!adminGroup) {
        promises.push(userAdminGroup.save());
        console.log('UserGroup "Admin" saved with Permissions:', userAdminGroup.permissions);
      } else if (adminGroup.permissions.toString() !== userAdminGroup.permissions.toString()) {
        adminGroup.permissions = userAdminGroup.permissions;
        promises.push(adminGroup.save());
        console.log('UserGroup "Admin" permissions updated:', userAdminGroup.permissions);
      }
  
      if (!operatorGroup) {
        promises.push(userOperatorGroup.save());
        console.log('UserGroup "Operator" saved with Permissions:', userOperatorGroup.permissions);
      } else if (operatorGroup.permissions.toString() !== userOperatorGroup.permissions.toString()) {
        operatorGroup.permissions = userOperatorGroup.permissions;
        promises.push(operatorGroup.save());
        console.log('UserGroup "Operator" permissions updated:', userOperatorGroup.permissions);
      }
  
      if (!userGroup) {
        promises.push(userUserGroup.save());
        console.log('UserGroup "User" saved with Permissions:', userUserGroup.permissions);
      } else if (userGroup.permissions.toString() !== userUserGroup.permissions.toString()) {
        userGroup.permissions = userUserGroup.permissions;
        promises.push(userGroup.save());
        console.log('UserGroup "User" permissions updated:', userUserGroup.permissions);
      }
  
  
      await Promise.all(promises);
    } catch (error) {
      console.error('Error saving Default UserGroups and RegistrationKeys Database Data:', error);
    }
  };
  
  saveDefaultUserDatabaseData();

    module.exports = UserGroup;
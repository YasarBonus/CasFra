const mongoose = require('mongoose');
const generateRandomPriority = require('../../../utils/generateRandomPriority');

// Define RegistrationKey schema
const registrationKeySchema = new mongoose.Schema({
    regkey: {
      type: String,
      required: true,
      unique: true
    },
    created: {
      type: Date,
      default: Date.now,
      required: true
    },
    used: {
      type: Boolean,
      default: false,
      required: true
    },
    usedDate: Date,
    userId: String,
    userIp: String,
    priority: {
      type: Number,
      default: generateRandomPriority()
    },
    tenancies: [String],
    assign_tenancy: String,
    assign_tenancies: [String],
    assign_group: String,
  });
  
  const RegistrationKey = mongoose.model('RegistrationKey', registrationKeySchema);


  const registrationKeyEntries = [{
    regkey: 'admin',
    created: new Date(),
    used: false,
    assign_group: '658361b4cd18680f4d0f4eb7',
    assign_tenancy: '65874079a5a4f802408f7ca5',
    assign_tenancies: ['65874079a5a4f802408f7ca5'],
  }];

    const saveDefaultRegistrationKeyDatabaseData = async () => {
        try {
            const promises = [];
        
            for (const registrationKeyEntry of registrationKeyEntries) {
            const existingRegistrationKey = await RegistrationKey.findOne({
                regkey: registrationKeyEntry.regkey
            });
        
            if (!existingRegistrationKey) {
                promises.push(RegistrationKey.create(registrationKeyEntry));
            }
            }
        
            await Promise.all(promises);
        } catch (error) {
            console.log(error);
        }
        };

        saveDefaultRegistrationKeyDatabaseData();

module.exports = RegistrationKey;
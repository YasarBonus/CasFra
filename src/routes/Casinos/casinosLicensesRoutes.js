// const router = require("../authRoutes");
// ?? war beides plötzlich hier const { route } = require("../authRoutes");

const express = require('express');
const router = express.Router();
const logger = require('../../modules/winston.js');
const db = require('../../db/database.js');
const checkPermissions = require('../../middlewares/permissionMiddleware.js');



// Get all casino licenses from MongoDB
router.get('/casinos/licenses', checkPermissions('manageCasinos'), (req, res) => {
    db.CasinoLicenses.find({
        tenancies: req.session.user.tenancy
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino licenses:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get amount of all casino licenses from MongoDB
  router.get('/casinos/licenses/count', checkPermissions('manageCasinos'), (req, res) => {
    db.CasinoLicenses.countDocuments({
        tenancies: req.session.user.tenancy
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino licenses count:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get details of a specific casino license
  router.get('/casinos/licenses/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoLicenses.findOne({
        _id: id,
        tenancies: tenancy
      })
      .then((casinoLicense) => {
        if (!casinoLicense) {
          return res.status(404).json({
            error: 'Casino license not found'
          });
        }
  
        res.json(casinoLicense);
      })
      .catch((error) => {
        console.error('Error retrieving casino license:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Insert casino license into MongoDB
  router.post('/casinos/licenses/add', checkPermissions('manageCasinos'), (req, res) => {
    const {
      name,
      description,
      image,
      active
    } = req.body;
    const {
      userId
    } = req.session.user;
  
    const casinoLicenses = new db.CasinoLicenses({
      addedBy: userId,
      name: name,
      description: description,
      image: image,
      active: active,
      addedDate: Date.now(),
      tenancies: [req.session.user.tenancy] // Add the user's tenancy to the tenancies array
    });
  
    casinoLicenses.save()
      .then(() => {
        res.redirect('/dashboard');
      })
      .catch((error) => {
        console.error('Error inserting casino license:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Swap casino license priority
  router.put('/casinos/licenses/swap', checkPermissions('manageCasinos'), (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id1,
      id2
    } = req.body;
  
    db.CasinoLicenses.findOne({
        _id: id1,
        tenancies: req.session.user.tenancy // Check if tenancies includes req.session.user.tenancy
      })
      .then((casinoLicense1) => {
        if (!casinoLicense1) {
          throw new Error('Casino license 1 not found');
        } else {
          db.CasinoLicenses.findOne({
              _id: id2,
              tenancies: req.session.user.tenancy // Check if tenancies includes req.session.user.tenancy
            })
            .then((casinoLicense2) => {
              if (!casinoLicense2) {
                throw new Error('Casino license 2 not found');
              } else {
                const tempPriority = casinoLicense1.priority;
                casinoLicense1.priority = casinoLicense2.priority;
                casinoLicense2.priority = tempPriority;
  
                casinoLicense1.save()
                  .then(() => {
                    casinoLicense2.save()
                      .then(() => {
                        res.status(200).json({
                          message: 'Casino license priority swapped successfully'
                        });
                      })
                      .catch((error) => {
                        console.error('Error swapping casino license priority:', error);
                        res.status(500).json({
                          error: 'Internal server error'
                        });
                      });
                  })
                  .catch((error) => {
                    console.error('Error swapping casino license priority:', error);
                    res.status(500).json({
                      error: 'Internal server error'
                    });
                  });
              }
            })
            .catch((error) => {
              console.error('Error swapping casino license priority:', error);
              res.status(500).json({
                error: 'Internal server error'
              });
            });
        }
      })
      .catch((error) => {
        console.error('Error swapping casino license priority:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Delete casino license
  router.delete('/casinos/licenses/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
  
    db.CasinoLicenses.findOneAndDelete({
        _id: id,
        tenancies: req.session.user.tenancy // Check if tenancies includes req.session.user.tenancy
      })
      .then((deletedCasinoLicense) => {
        if (!deletedCasinoLicense) {
          throw new Error('Casino license not found');
        }
        res.json(deletedCasinoLicense);
        console.log('Casino license deleted: ' + deletedCasinoLicense.name);
      })
      .catch((error) => {
        console.error('Error deleting casino license:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  
  
  // Duplicate casino license
  router.post('/casinos/licenses/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id
    } = req.params;
  
    db.CasinoLicenses.findOne({
        _id: id,
        tenancies: req.session.user.tenancy // Check if tenancies includes req.session.user.tenancy
      })
      .then((casinoLicenses) => {
        if (!casinoLicenses) {
          throw new Error('Casino license not found');
        } else {
          newPriority = generateRandomPriority();
          const newCasinoLicenses = new CasinoLicenses({
            addedBy: userId,
            name: casinoLicenses.name + ' (Copy)',
            description: casinoLicenses.description,
            image: casinoLicenses.image,
            priority: newPriority,
            active: casinoLicenses.active,
            addedDate: Date.now(),
            tenancies: [req.session.user.tenancy] // Add the user's tenancy to the tenancies array
          });
  
          newCasinoLicenses.save()
            .then(() => {
              res.redirect('/dashboard');
            })
            .catch((error) => {
              console.error('Error duplicating casino license:', error);
              res.status(500).json({
                error: 'Internal server error'
              });
            });
        }
      })
      .catch((error) => {
        console.error('Error duplicating casino license:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  
  
  // Edit casino license
  router.put('/casinos/licenses/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id
    } = req.params;
    const {
      name,
      description,
      image,
      priority,
      active
    } = req.body;
  
    db.CasinoLicenses.findOneAndUpdate({
        _id: id,
        tenancies: req.session.user.tenancy // Check if tenancies includes req.session.user.tenancy
      }, {
        name,
        description,
        image,
        priority,
        active
      }, {
        modifiedBy: userId,
        modifiedDate: Date.now()
      })
      .then((updatedCasinoLicenses) => {
        if (!updatedCasinoLicenses) {
          throw new Error('Casino license not found');
        }
        res.json(updatedCasinoLicenses);
        console.log('Casino license updated: ' + updatedCasinoLicenses.name);
      })
      .catch((error) => {
        console.error('Error updating casino license:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

  module.exports = router;
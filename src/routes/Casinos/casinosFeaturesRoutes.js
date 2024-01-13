const express = require('express');
const router = express.Router();
const logger = require('../../modules/winston.js');
const db = require('../../db/database.js');
const checkPermissions = require('../../middlewares/permissionMiddleware.js');



// Get all casino features from MongoDB
router.get('/', checkPermissions('manageCasinos'), (req, res) => {
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoFeatures.find({
        tenancies: tenancy
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino features:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

    // Insert casino feature into MongoDB
    router.post('/', checkPermissions('manageCasinos'), (req, res) => {
      const {
        name,
        description,
        image,
        priority,
        active
      } = req.body;
      const {
        userId
      } = req.session.user;
    
      const casinoFeatures = new db.CasinoFeatures({
        addedBy: userId,
        name: name,
        description: description,
        image: image,
        priority: priority,
        active: active,
        addedDate: Date.now(),
        tenancies: req.session.user.tenancy // Add tenancies field
      });
    
      casinoFeatures.save()
        .then(() => {
          logger.info('Casino feature inserted: ' + name);
          res.status(201).json(casinoFeatures);
        })
        .catch((error) => {
          console.error('Error inserting casino feature:', error);
          res.status(500).json({
            error: 'Internal server error'
          });
        });
    });
  
  // Get count of all features from MongoDB
  router.get('/count', checkPermissions('manageCasinos'), (req, res) => {
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoFeatures.countDocuments({
        tenancies: tenancy
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino features:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  
  // Get details of a specific casino feature
  router.get('/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoFeatures.findOne({
        _id: id,
        tenancies: tenancy
      })
      .then((casinoFeatures) => {
        if (!casinoFeatures) {
          return res.status(404).json({
            error: 'Casino feature not found'
          });
        }
  
        res.json(casinoFeatures);
      })
      .catch((error) => {
        console.error('Error retrieving casino feature:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  

  
  // Duplicate casino feature
  router.post('/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id
    } = req.params;
  
    db.CasinoFeatures.findOne({
        _id: id,
        tenancies: req.session.user.tenancy // Add condition to check tenancies
      })
      .then((casinoFeatures) => {
        if (!casinoFeatures) {
          throw new Error('Casino feature not found');
        } else {
          const newPriority = generateRandomPriority();
          const newCasinoFeatures = new CasinoFeatures({
            addedBy: userId,
            name: casinoFeatures.name + ' (Copy)',
            description: casinoFeatures.description,
            image: casinoFeatures.image,
            priority: newPriority,
            active: casinoFeatures.active,
            addedDate: Date.now(),
            tenancies: req.session.user.tenancy // Set tenancies to req.session.user.tenancy
          });
  
          newCasinoFeatures.save()
            .then(() => {
              res.redirect('/dashboard');
            })
            .catch((error) => {
              console.error('Error duplicating casino feature:', error);
              res.status(500).json({
                error: 'Internal server error'
              });
            });
        }
      })
      .catch((error) => {
        console.error('Error duplicating casino feature:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

  // Get casinos assigned to a specific feature
  router.get('/:id/casinos', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      tenancy
    } = req.session.user;
  
    db.Casino.find({
        features: id,
        tenancies: tenancy
      })
      .then((casinos) => {
        if (!casinos) {
          return res.status(404).json({
            error: 'Casinos not found'
          });
        }
  
        res.json(casinos);
      })
      .catch((error) => {
        console.error('Error retrieving casinos:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Edit casino feature
  router.put('/:id', checkPermissions('manageCasinos'), (req, res) => {
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
  
    db.CasinoFeatures.findOneAndUpdate({
        _id: id,
        tenancies: req.session.user.tenancy // Add condition to check tenancies
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
      .then((updatedCasinoFeatures) => {
        if (!updatedCasinoFeatures) {
          throw new Error('Casino feature not found');
        }
        res.json(updatedCasinoFeatures);
        console.log('Casino feature updated: ' + updatedCasinoFeatures.name);
      })
      .catch((error) => {
        console.error('Error updating casino feature:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Delete casino feature
  router.delete('/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoFeatures.findOneAndDelete({
        _id: id,
        tenancies: tenancy
      })
      .then((deletedCasinoFeature) => {
        if (!deletedCasinoFeature) {
          throw new Error('Casino feature not found');
        }
        res.json(deletedCasinoFeature);
        console.log('Casino feature deleted: ' + deletedCasinoFeature.name);
      })
      .catch((error) => {
        console.error('Error deleting casino feature:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

  module.exports = router;
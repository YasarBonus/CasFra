const express = require('express');
const router = express.Router();
const logger = require('../../modules/winston.js');
const db = require('../../db/database.js');
const checkPermissions = require('../../middlewares/permissionMiddleware.js');


// Get all casino individual features from MongoDB
router.get('/casinos/:id/individualfeatures', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
  
    db.CasinoIndividualFeatures.find({
        casino: id
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino individual features:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get count of all individual features
  router.get('/casinos/individualfeatures/count', checkPermissions('manageCasinos'), (req, res) => {
    db.CasinoIndividualFeatures.countDocuments()
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino individual features:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get details of a specific casino individual feature
  router.get('/casinos/:id/individualfeatures/:featureId', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id,
      featureId
    } = req.params;
  
    db.CasinoIndividualFeatures.findOne({
        casino: id,
        _id: featureId
      })
      .then((casinoIndividualFeatures) => {
        if (!casinoIndividualFeatures) {
          return res.status(404).json({
            error: 'Casino individual feature not found'
          });
        } else {
          res.json(casinoIndividualFeatures);
        }
      })
      .catch((error) => {
        console.error('Error retrieving casino individual feature:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Insert casino individual feature into MongoDB
  router.post('/casinos/:id/individualfeatures', checkPermissions('manageCasinos'), (req, res) => {
    const {
      name,
      description,
      image,
      priority,
      active
    } = req.body;
    const {
      id
    } = req.params;
    const {
      userId
    } = req.session.user;
  
    const casinoIndividualFeatures = new db.CasinoIndividualFeatures({
      addedBy: userId,
      casino: id,
      name: name,
      description: description,
      image: image,
      priority: priority,
      active: active,
      addedDate: Date.now(),
    });
  
    casinoIndividualFeatures.save()
      .then(() => {
        res.json({
          success: true
        });
      })
      .catch((error) => {
        console.error('Error inserting casino individual feature:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Duplicate casino individual feature
  router.post('/casinos/:id/individualfeatures/:featureId/duplicate', checkPermissions('manageCasinos'), (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id,
      featureId
    } = req.params;
  
    db.CasinoIndividualFeatures.findOne({
        _id: featureId
      })
      .then((casinoIndividualFeatures) => {
        if (!casinoIndividualFeatures) {
          throw new Error('Casino individual feature not found');
        } else {
          newPriority = generateRandomPriority();
          const newCasinoIndividualFeatures = new db.CasinoIndividualFeatures({
            addedBy: userId,
            casino: id,
            name: casinoIndividualFeatures.name + ' (Copy)',
            description: casinoIndividualFeatures.description,
            image: casinoIndividualFeatures.image,
            priority: newPriority,
            active: casinoIndividualFeatures.active,
            addedDate: Date.now(),
          });
  
          newCasinoIndividualFeatures.save()
            .then(() => {
              res.redirect('/dashboard');
            })
            .catch((error) => {
              console.error('Error duplicating casino individual feature:', error);
              res.status(500).json({
                error: 'Internal server error'
              });
            });
        }
      })
      .catch((error) => {
        console.error('Error duplicating casino individual feature:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Edit casino individual feature
  router.put('/casinos/:id/individualfeatures/:featureId', checkPermissions('manageCasinos'), (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id,
      featureId
    } = req.params;
    const {
      name,
      description,
      image,
      priority,
      active
    } = req.body;
  
    db.CasinoIndividualFeatures.findOneAndUpdate({
        _id: featureId
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
      .then((updatedCasinoIndividualFeatures) => {
        if (!updatedCasinoIndividualFeatures) {
          throw new Error('Casino individual feature not found');
        }
        res.json(updatedCasinoIndividualFeatures);
        console.log('Casino individual feature updated: ' + updatedCasinoIndividualFeatures.name);
      })
      .catch((error) => {
        console.error('Error updating casino individual feature:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Delete casino individual feature
  router.delete('/casinos/:id/individualfeatures/:featureId', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id,
      featureId
    } = req.params;
  
    db.CasinoIndividualFeatures.findOneAndDelete({
        _id: featureId
      })
      .then((deletedCasinoIndividualFeature) => {
        if (!deletedCasinoIndividualFeature) {
          throw new Error('Casino individual feature not found');
        }
        res.json(deletedCasinoIndividualFeature);
        console.log('Casino individual feature deleted: ' + deletedCasinoIndividualFeature.name);
      })
      .catch((error) => {
        console.error('Error deleting casino individual feature:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

  module.exports = router;
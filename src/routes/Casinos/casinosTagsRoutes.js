const express = require('express');
const router = express.Router();
const logger = require('../../modules/winston.js');
const db = require('../../db/database.js');
const checkPermissions = require('../../middlewares/permissionMiddleware.js');


// Insert casino tag into MongoDB
router.post('/casinos/tags', checkPermissions('manageCasinos'), (req, res) => {
    const {
      name,
      description,
      image,
      active
    } = req.body;
    const {
      userId
    } = req.session.user;
    const {
      tenancy
    } = req.session.user;
  
    const casinoTags = new CasinoTags({
      addedBy: userId,
      name: name,
      description: description,
      image: image,
      active: active,
      addedDate: Date.now(),
      tenancies: [tenancy], // Set the tenancies to an array containing the user's tenancy
    });
  
    // Save the casino tag to the database
    casinoTags.save()
      .then((savedCasinoTag) => {
        res.json(savedCasinoTag);
        console.log('Casino tag saved:', savedCasinoTag);
      })
      .catch((error) => {
        console.error('Error saving casino tag:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get all casino tags from MongoDB
  router.get('/casinos/tags', checkPermissions('manageCasinos'), (req, res) => {
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoTags.find({
        tenancies: tenancy
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino tags:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get amount of all tags
  router.get('/casinos/tags/count', checkPermissions('manageCasinos'), (req, res) => {
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoTags.countDocuments({
        tenancies: tenancy
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino tags:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get details of a specific casino tag
  router.get('/casinos/tags/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoTags.findOne({
        _id: id,
        tenancies: tenancy
      })
      .then((casinoTag) => {
        if (!casinoTag) {
          return res.status(404).json({
            error: 'Casino tag not found'
          });
        }
  
        res.json(casinoTag);
      })
      .catch((error) => {
        console.error('Error retrieving casino tag:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Insert casino tag into MongoDB
  router.post('/casinos/tags', checkPermissions('manageCasinos'), (req, res) => {
    const {
      name,
      description,
      image,
      active
    } = req.body;
    const {
      userId
    } = req.session.user;
    const {
      tenancy
    } = req.session.user;
  
    const casinoTags = new CasinoTags({
      addedBy: userId,
      name: name,
      description: description,
      image: image,
      active: active,
      addedDate: Date.now(),
      tenancies: [tenancy], // Set the tenancies to an array containing the user's tenancy
    });
  
    casinoTags.save()
      .then(() => {
        res.redirect('/dashboard');
      })
      .catch((error) => {
        console.error('Error inserting casino tag:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Duplicate casino tag
  router.post('/casinos/tags/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id
    } = req.params;
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoTags.findOne({
        _id: id,
        tenancies: tenancy
      })
      .then((casinoTags) => {
        if (!casinoTags) {
          throw new Error('Casino tag not found');
        } else {
          const newPriority = generateRandomPriority();
          const newCasinoTags = new CasinoTags({
            addedBy: userId,
            name: casinoTags.name + ' (Copy)',
            description: casinoTags.description,
            image: casinoTags.image,
            priority: newPriority,
            active: casinoTags.active,
            addedDate: Date.now(),
            tenancies: casinoTags.tenancies, // Copy the tenancies from the original object
          });
  
          newCasinoTags.save()
            .then(() => {
              res.redirect('/dashboard');
            })
            .catch((error) => {
              console.error('Error duplicating casino tag:', error);
              res.status(500).json({
                error: 'Internal server error'
              });
            });
        }
      })
      .catch((error) => {
        console.error('Error duplicating casino tag:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Edit casino tag
  router.put('/casinos/tags/:id', checkPermissions('manageCasinos'), (req, res) => {
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
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoTags.findOneAndUpdate({
          _id: id,
          tenancies: tenancy
        }, // Only update if tenancies match
        {
          name,
          description,
          image,
          priority,
          active
        }, {
          modifiedBy: userId,
          modifiedDate: Date.now()
        }
      )
      .then((updatedCasinoTags) => {
        if (!updatedCasinoTags) {
          throw new Error('Casino tag not found');
        }
        res.json(updatedCasinoTags);
        console.log('Casino tag updated: ' + updatedCasinoTags.name);
      })
      .catch((error) => {
        console.error('Error updating casino tag:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Delete casino tag
  router.delete('/casinos/tags/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoTags.findOneAndDelete({
        _id: id,
        tenancies: tenancy
      })
      .then((deletedCasinoTag) => {
        if (!deletedCasinoTag) {
          throw new Error('Casino tag not found');
        }
        res.json(deletedCasinoTag);
        console.log('Casino tag deleted: ' + deletedCasinoTag.name);
      })
      .catch((error) => {
        console.error('Error deleting casino tag:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

  module.exports = router;
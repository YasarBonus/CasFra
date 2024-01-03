const express = require('express');
const router = express.Router();
const logger = require('../../modules/winston.js');
const db = require('../../db/database.js');
const checkPermissions = require('../../middlewares/permissionMiddleware.js');




// Get count of all casino wager types from MongoDB
router.get('/casinos/wagertypes/count', checkPermissions('manageCasinos'), (req, res) => {
    const tenancy = req.session.user.tenancy; // Get the user's tenancy from the session
  
    db.CasinoWagerTypes.countDocuments({
        tenancies: tenancy
      }) // Filter by tenancy
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino wager types count:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get details of a specific casino wager type
  router.get('/casinos/wagertypes/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
    const tenancy = req.session.user.tenancy; // Get the user's tenancy from the session
  
    db.CasinoWagerTypes.findOne({
        _id: id,
        tenancies: tenancy
      }) // Filter by id and tenancy
      .then((casinoWagerTypes) => {
        if (!casinoWagerTypes) {
          // Handle not found case
        } else {
          res.json(casinoWagerTypes);
        }
      })
      .catch((error) => {
        console.error('Error retrieving casino wager type:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get all casino wager types from MongoDB
  router.get('/casinos/wagertypes', checkPermissions('manageCasinos'), (req, res) => {
    const tenancy = req.session.user.tenancy; // Get the user's tenancy from the session
  
    db.CasinoWagerTypes.find({
        tenancies: tenancy
      }) // Filter by tenancy
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino wager types:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Duplicate casino wager type
  router.post('/casinos/wagertypes/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id
    } = req.params;
    const tenancy = req.session.user.tenancy; // Get the user's tenancy from the session
  
    db.CasinoWagerTypes.findOne({
        _id: id,
        tenancies: tenancy
      })
      .then((casinoWagerTypes) => {
        if (!casinoWagerTypes) {
          throw new Error('Casino wager type not found');
        } else {
          newPriority = generateRandomPriority();
          const newCasinoWagerTypes = new CasinoWagerTypes({
            addedBy: userId,
            name: casinoWagerTypes.name + ' (Copy)',
            description: casinoWagerTypes.description,
            image: casinoWagerTypes.image,
            priority: newPriority,
            active: casinoWagerTypes.active,
            addedDate: Date.now(),
            tenancies: [tenancy] // Set the tenancy for the duplicated casino wager type
          });
  
          newCasinoWagerTypes.save()
            .then(() => {
              res.redirect('/dashboard');
            })
            .catch((error) => {
              console.error('Error duplicating casino wager type:', error);
              res.status(500).json({
                error: 'Internal server error'
              });
            });
        }
      })
      .catch((error) => {
        console.error('Error duplicating casino wager type:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Edit casino wager type
  router.put('/casinos/wagertypes/:id', checkPermissions('manageCasinos'), (req, res) => {
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
    const tenancy = req.session.user.tenancy; // Get the user's tenancy from the session
  
    db.CasinoWagerTypes.findOneAndUpdate({
        _id: id,
        tenancies: tenancy
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
      .then((updatedCasinoWagerTypes) => {
        if (!updatedCasinoWagerTypes) {
          throw new Error('Casino wager type not found');
        }
        res.json(updatedCasinoWagerTypes);
        console.log('Casino wager type updated: ' + updatedCasinoWagerTypes.name);
      })
      .catch((error) => {
        console.error('Error updating casino wager type:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Delete casino wager type
  router.delete('/casinos/wagertypes/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
    const tenancy = req.session.user.tenancy; // Get the user's tenancy from the session
  
    db.CasinoWagerTypes.findOneAndDelete({
        _id: id,
        tenancies: tenancy
      })
      .then((deletedCasinoWagerType) => {
        if (!deletedCasinoWagerType) {
          throw new Error('Casino wager type not found');
        }
        res.json(deletedCasinoWagerType);
        console.log('Casino wager type deleted: ' + deletedCasinoWagerType.name);
      })
      .catch((error) => {
        console.error('Error deleting casino wager type:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

  module.exports = router;
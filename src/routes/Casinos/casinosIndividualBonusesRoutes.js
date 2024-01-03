const express = require('express');
const router = express.Router();
const logger = require('../../modules/winston.js');
const db = require('../../db/database.js');
const checkPermissions = require('../../middlewares/permissionMiddleware.js');



// Get all casino individual bonuses from MongoDB
router.get('/casinos/:id/individualbonuses', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
  
    db.CasinoIndividualBonuses.find({
        casino: id
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino individual bonuses:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get count of all individual bonuses
  router.get('/casinos/individualbonuses/count', checkPermissions('manageCasinos'), (req, res) => {
    db.CasinoIndividualBonuses.countDocuments()
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino individual bonuses count:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get details of a specific casino individual bonus
  router.get('/casinos/:id/individualbonuses/:bonusId', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id,
      bonusId
    } = req.params;
  
    db.CasinoIndividualBonuses.findOne({
        casino: id,
        _id: bonusId
      })
      .then((casinoIndividualBonuses) => {
        if (!casinoIndividualBonuses) {
          return res.status(404).json({
            error: 'Casino individual bonus not found'
          });
        } else {
          res.json(casinoIndividualBonuses);
        }
      })
      .catch((error) => {
        console.error('Error retrieving casino individual bonus:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Insert casino individual bonus into MongoDB
  router.post('/casinos/:id/individualbonuses', checkPermissions('manageCasinos'), (req, res) => {
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
  
    const casinoIndividualBonuses = new db.CasinoIndividualBonuses({
      addedBy: userId,
      casino: id,
      name: name,
      description: description,
      image: image,
      priority: priority,
      active: active,
      addedDate: Date.now(),
    });
  
    casinoIndividualBonuses.save()
      .then(() => {
        res.json({
          success: true
        });
      })
      .catch((error) => {
        console.error('Error inserting casino individual bonus:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Delete casino individual bonus
  router.delete('/casinos/:id/individualbonuses/:bonusId', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id,
      bonusId
    } = req.params;
  
    db.CasinoIndividualBonuses.findOneAndDelete({
        _id: bonusId
      })
      .then((deletedCasinoIndividualBonus) => {
        if (!deletedCasinoIndividualBonus) {
          throw new Error('Casino individual bonus not found');
        }
        res.json(deletedCasinoIndividualBonus);
        console.log('Casino individual bonus deleted: ' + deletedCasinoIndividualBonus.name);
      })
      .catch((error) => {
        console.error('Error deleting casino individual bonus:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

  module.exports = router;
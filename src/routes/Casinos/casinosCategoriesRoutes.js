const express = require('express');
const router = express.Router();
const logger = require('../../modules/winston.js');
const db = require('../../db/database.js');

const checkPermissions = require('../../middlewares/permissionMiddleware.js');


// Get all casino categories from MongoDB
router.get('/', checkPermissions('manageCasinos'), (req, res) => {
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoCategories.find({
        tenancies: tenancy
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino categories:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

// Insert casino category into MongoDB
router.post('/', checkPermissions('manageCasinos'), (req, res) => {
  const {
    name,
    description,
    image,
    active
  } = req.body;
  const {
    userId
  } = req.session.user;

  const casinoCategories = new db.CasinoCategories({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    active: active,
    addedDate: Date.now(),
    tenancies: req.session.user.tenancy // Add tenancy condition
  });

  casinoCategories.save()
    .then(() => {
      logger.info('Casino category inserted: ' + name);
      res.status(201).json(casinoCategories);
    })
    .catch((error) => {
      console.error('Error inserting casino category:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

  // Get amount of all categories
  router.get('/count', checkPermissions('manageCasinos'), (req, res) => {
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoCategories.countDocuments({
        tenancies: tenancy
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving casino categories:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

  // Get details of a specific casino category
  router.get('/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      tenancy
    } = req.session.user;
  
    db.CasinoCategories.findOne({
        _id: id,
        tenancies: tenancy
      })
      .then((casinoCategory) => {
        if (!casinoCategory) {
          return res.status(404).json({
            error: 'Casino category not found'
          });
        }
  
        res.json(casinoCategory);
      })
      .catch((error) => {
        console.error('Error retrieving casino category:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

  // Get all casinos from a specific category
  router.get('/:id/casinos', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      tenancy
    } = req.session.user;

    db.Casino.find({
        casinoCategories: id,
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
  
  // Duplicate casino category
  router.post('/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id
    } = req.params;
  
    db.CasinoCategories.findOne({
        _id: id,
        tenancies: req.session.user.tenancy // Add tenancy condition
      })
      .then((casinoCategories) => {
        if (!casinoCategories) {
          throw new Error('Casino category not found');
        } else {
          const newCasinoCategories = new CasinoCategories({
            addedBy: userId,
            name: casinoCategories.name + ' (Copy)',
            description: casinoCategories.description,
            image: casinoCategories.image,
            active: casinoCategories.active,
            addedDate: Date.now(),
            tenancies: req.session.user.tenancy // Set tenancy for duplicated category
          });
  
          newCasinoCategories.save()
            .then(() => {
              res.redirect('/dashboard');
            })
            .catch((error) => {
              console.error('Error inserting casino category:', error);
              res.status(500).json({
                error: 'Internal server error'
              });
            });
        }
      })
      .catch((error) => {
        console.error('Error duplicating casino category:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Edit casino category
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
      active
    } = req.body;
  
    db.CasinoCategories.findOneAndUpdate({
        _id: id,
        tenancies: req.session.user.tenancy // Add tenancy condition
      }, {
        name,
        description,
        image,
        active
      }, {
        modifiedBy: userId,
        modifiedDate: Date.now()
      })
      .then((updatedCasinoCategories) => {
        if (!updatedCasinoCategories) {
          throw new Error('Casino category not found');
        }
        res.json(updatedCasinoCategories);
        console.log('Casino category updated: ' + updatedCasinoCategories.name);
      })
      .catch((error) => {
        console.error('Error updating casino category:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Delete casino category
  router.delete('/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params;
  
    db.CasinoCategories.findOneAndDelete({
        _id: id,
        tenancies: req.session.user.tenancy // Add tenancy condition
      })
      .then((deletedCasinoCategory) => {
        if (!deletedCasinoCategory) {
          throw new Error('Casino category not found');
        }
        res.json(deletedCasinoCategory);
        console.log('Casino category deleted: ' + deletedCasinoCategory.name);
      })
      .catch((error) => {
        console.error('Error deleting casino category:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

  module.exports = router;
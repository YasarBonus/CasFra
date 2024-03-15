const express = require('express');
const router = express.Router();
const logger = require('../../modules/winston.js');
const db = require('../../db/database.js');
const checkPermissions = require('../../middlewares/permissionMiddleware.js');


// Get all casinos from MongoDB
router.get('/', checkPermissions('manageCasinos'), async (req, res) => {
    try {
      const results = await db.Casino.find({
        tenancies: req.session.user.tenancy
      }); // Retrieve casinos with matching tenancy
      res.json(results);
    } catch (error) {
      console.error('Error retrieving casinos:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });
  
  // Get amount of active and inactive casinos
  // Get the maxCasinos from the Tenancy and calculate the percentage used from maxCasinos and activeCasinos
  // respond with activeCount, inactiveCount, maxCasinos, remainingCaisnos, percentageUsed, percentageFree, percentageActive, percentageInactive
  router.get('/activeinactive', checkPermissions('manageCasinos'), async (req, res) => {
    try {
      const activeCount = await db.Casino.countDocuments({
        tenancies: req.session.user.tenancy,
        active: true
      }); // Get the amount of active casinos
      const inactiveCount = await db.Casino.countDocuments({
        tenancies: req.session.user.tenancy,
        active: false
      }); // Get the amount of inactive casinos
      const tenancy = await db.Tenancies.findOne({
        _id: req.session.user.tenancy
      }); // Get the tenancy of the current user
      const maxCasinos = tenancy.maxCasinos; // Get the maxCasinos from the tenancy
      const remainingCasinos = maxCasinos - activeCount; // Calculate the remaining casinos
      const percentageUsed = Math.round((activeCount / maxCasinos) * 100); // Calculate the percentage used
      const percentageFree = Math.round((remainingCasinos / maxCasinos) * 100); // Calculate the percentage free
      const percentageActive = Math.round((activeCount / (activeCount + inactiveCount)) * 100); // Calculate the percentage active
      const percentageInactive = Math.round((inactiveCount / (activeCount + inactiveCount)) * 100); // Calculate the percentage inactive
  
      res.json({
        allCasinos: activeCount + inactiveCount,
        activeCount,
        inactiveCount,
        maxCasinos,
        remainingCasinos,
        percentageUsed,
        percentageFree,
        percentageActive,
        percentageInactive
      });
    } catch (error) {
      console.error('Error retrieving active and inactive casinos:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });
  
  
  // Get the details of a specific casino
  router.get('/:id', checkPermissions('manageCasinos'), async (req, res) => {
    const {
      id
    } = req.params;
  
    try {
      const casino = await db.Casino.findOne({
        _id: id,
        tenancies: req.session.user.tenancy
      }); // Retrieve casino with matching tenancy
      if (!casino) {
        return res.status(404).json({
          error: 'Casino not found'
        });
      }
      res.json(casino);
    } catch (error) {
      console.error('Error retrieving casino:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });
  
  // Create a new casino
  router.post('/', checkPermissions('manageCasinos'), (req, res) => {
    const {
      name
    } = req.body; // Get the name and location from the request body
    const {
      userId,
      tenancy
    } = req.session.user; // Get the user ID from the session data

    // Create a new casino object
    const newCasino = new db.Casino({
      addedBy: userId,
      name: name,
      addedDate: Date.now(),
      addedBy: userId,
      tenancies: tenancy
    });
  
    // Save the new casino to the database
    newCasino.save()
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        console.error('Error creating casino:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Duplicate a casino
  router.post('/:id/duplicate', checkPermissions('manageCasinos'), async (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id
    } = req.params;
  
    try {
      const tenancies = await getTenancyByUserId(userId); // Get the tenancyId of the current user
      const casino = await db.Casino.findOne({
        _id: id,
        tenancies
      }); // Check if the casino belongs to the user's tenancy
  
      if (!casino) {
        throw new Error('Casino not found');
      }
  
      const newPriority = generateRandomPriority();
      const newCasino = new db.Casino({
        addedBy: userId,
        name: casino.name + ' (Copy)',
        categories: casino.categories,
        description: casino.description,
        priority: newPriority,
        active: casino.active,
        newCasino: casino.newCasino,
        label: casino.label,
        labelLarge: casino.labelLarge,
        individualBonuses: casino.individualBonuses,
        displayBonus: casino.displayBonus,
        maxBet: casino.maxBet,
        maxCashout: casino.maxCashout,
        wager: casino.wager,
        wagerType: casino.wagerType,
        noDeposit: casino.noDeposit,
        prohibitedGamesProtection: casino.prohibitedGamesProtection,
        vpn: casino.vpn,
        features: casino.features,
        providers: casino.providers,
        paymentMethods: casino.paymentMethods,
        review: casino.review,
        reviewTitle: casino.reviewTitle,
        image: casino.image,
        affiliateUrl: casino.affiliateUrl,
        affiliateShortlink: casino.affiliateShortlink,
        addedDate: Date.now(),
        tenancies: casino.tenancies,
      });
  
      await newCasino.save();
      setCasinoImageUrl(newCasino._id); // Call setCasinoImageUrl function
  
      res.status(200).json({
        message: 'Casino duplicated'
      });
    } catch (error) {
      console.error('Error duplicating casino:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });
  
  // Edit a casino
  router.put('/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id
    } = req.params;
    const {
      name,
      categories,
      description,
      priority,
      active,
      newCasino,
      label,
      labelLarge,
      individualBonuses,
      displayBonus,
      maxBet,
      maxCashout,
      wager,
      wagerType,
      noDeposit,
      prohibitedGamesProtection,
      vpn,
      features,
      individualFeatures,
      tags,
      providers,
      paymentMethods,
      review,
      reviewTitle,
      image,
      affiliateUrl,
      affiliateShortlink,
      licenses
    } = req.body; // Get the updated values from the request body
  
    // Add the condition to check if the user has access to the casino
    db.Casino.findOneAndUpdate({
        _id: id,
        tenancies: req.session.user.tenancy // Check if the user's tenancy is included
      }, {
        name,
        categories,
        description,
        priority,
        active,
        newCasino,
        label,
        labelLarge,
        individualBonuses,
        displayBonus,
        maxBet,
        maxCashout,
        wager,
        wagerType,
        noDeposit,
        prohibitedGamesProtection,
        vpn,
        tags,
        features,
        individualFeatures,
        providers,
        paymentMethods,
        review,
        reviewTitle,
        image,
        affiliateUrl,
        affiliateShortlink,
        licenses
      }, {
        modifiedBy: userId,
        modifiedDate: Date.now()
      })
      .then((updatedCasino) => {
        if (!updatedCasino) {
          throw new Error('Casino not found');
        }
        res.json(updatedCasino);
        console.log('Casino updated: ' + updatedCasino.name);
  
        // Call setCasinoImageUrl(ID) function here
        setCasinoImageUrl(updatedCasino._id);
        createShortLinks(updatedCasino._id);
      })
      .catch((error) => {
        console.error('Error updating casino:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Toggle the active status of a casino by its ID
  router.put('/:id/toggleActive', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params; // Get the ID of the casino from the request params
  
    // Validate the ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format'
      });
    }
  
    // Find the casino by its ID and tenancy
    db.Casino.findOne({
        _id: id,
        tenancies: req.session.user.tenancy
      })
      .then((casino) => {
        if (!casino) {
          throw new Error('Casino not found');
        }
  
        // Toggle the active status
        casino.active = !casino.active;
        return casino.save();
      })
      .then((updatedCasino) => {
        res.json({
          success: true,
          casino: updatedCasino
        });
      })
      .catch((error) => {
        console.error('Error toggling active status:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Swap the priority of two casinos by their ID
  router.put('/priority/swap', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id1,
      id2
    } = req.body; // Get the IDs of the two casinos from the request body
  
    console.log(id1 + ' ' + id2);
  
    // Validate the IDs
    if (!id1.match(/^[0-9a-fA-F]{24}$/) || !id2.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format'
      });
    }
  
    // Check if id1 and id2 are the same
    if (id1 === id2) {
      return res.status(400).json({
        error: 'Cannot swap priority of the same casino'
      });
    }
  
    // Find the two casinos by their IDs and tenancy
    db.Casino.find({
        _id: {
          $in: [id1, id2]
        },
        tenancies: req.session.user.tenancy
      }) // Add tenancy check
      .then((casinos) => {
        if (casinos.length !== 2) {
          throw new Error('Two casinos not found');
        }
        console.log('Found Casinos:');
        // Swap the priorities of the two casinos
        const priority1 = casinos[0].priority;
        casinos[0].priority = casinos[1].priority;
        casinos[1].priority = priority1;
  
        // Save the updated casinos
        return Promise.all([casinos[0].save(), casinos[1].save()]);
      })
      .then((updatedCasinos) => {
        res.json(updatedCasinos);
        console.log('Casinos priority swapped');
      })
      .catch((error) => {
        console.error('Error swapping casinos priority:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get individualbonus of a specific casino by ID
  router.get('/:id/individualbonuses', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params; // Get the ID from the request params
    db.Casino.findOne({
        _id: id,
        tenancies: req.session.user.tenancy
      }) // Add tenancy check
      .then((result) => {
        res.json(result.individualBonuses);
      })
      .catch((error) => {
        console.error('Error retrieving casino individualbonuses:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get features of a specific casino by ID
  router.get('/:id/features', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params; // Get the ID from the request params
    db.Casino.findOne({
        _id: id,
        tenancies: req.session.user.tenancy
      }) // Add tenancy check
      .then((result) => {
        res.json(result.features);
      })
      .catch((error) => {
        console.error('Error retrieving casino features:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get image of a specific casino by ID
  router.get('/:id/image', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params; // Get the ID from the request params
    db.Casino.findOne({
        _id: id,
        tenancies: req.session.user.tenancy
      }) // Add tenancy check
      .then((result) => {
        res.json(result.image);
      })
      .catch((error) => {
        console.error('Error retrieving casino image:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get categories of a specific casino by ID
  router.get('/:id/categories', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params; // Get the ID from the request params
    db.Casino.findOne({
        _id: id,
        tenancies: req.session.user.tenancy
      }) // Add tenancy check
      .then((result) => {
        res.json(result.categories);
      })
      .catch((error) => {
        console.error('Error retrieving casino categories:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get wagerTypes of a specific casino by ID
  router.get('/:id/wagertypes', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params; // Get the ID from the request params
    db.Casino.findOne({
        _id: id,
        tenancies: req.session.user.tenancy
      }) // Add tenancy check
      .then((result) => {
        res.json(result.wagerTypes);
      })
      .catch((error) => {
        console.error('Error retrieving casino wagerTypes:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get providers of a specific casino by ID
  router.get('/:id/providers', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params; // Get the ID from the request params
    db.Casino.findOne({
        _id: id,
        tenancies: req.session.user.tenancy
      }) // Add tenancy check
      .then((result) => {
        res.json(result.providers);
      })
      .catch((error) => {
        console.error('Error retrieving casino providers:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get licenses of a specific casino by ID
  router.get('/:id/licenses', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params; // Get the ID from the request params
    db.Casino.findOne({
        _id: id,
        tenancies: req.session.user.tenancy
      }) // Add tenancy check
      .then((result) => {
        res.json(result.licenses);
      })
      .catch((error) => {
        console.error('Error retrieving casino licenses:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get paymentMethods of a specific casino by ID
  router.get('/:id/paymentmethods', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params; // Get the ID from the request params
    db.Casino.findOne({
        _id: id,
        tenancies: req.session.user.tenancy
      }) // Add tenancy check
      .then((result) => {
        res.json(result.paymentMethods);
      })
      .catch((error) => {
        console.error('Error retrieving casino paymentMethods:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  
  
  // Delete a casino by its ID
  router.delete('/:id', checkPermissions('manageCasinos'), (req, res) => {
    const {
      id
    } = req.params; // Get the ID from the request params
  
    // Validate the ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format'
      });
    }
  
    // Find the casino by its ID and tenancy
    db.Casino.findOneAndDelete({
        _id: id,
        tenancies: req.session.user.tenancy
      })
      .then((deletedCasino) => {
        if (!deletedCasino) {
          throw new Error('Casino not found');
        }
        res.json(deletedCasino);
        console.log('Casino deleted: ' + deletedCasino.name);
      })
      .catch((error) => {
        console.error('Error deleting casino:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

module.exports = router;
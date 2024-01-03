const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const checkPermissions = require('../middlewares/permissionMiddleware.js');

// Get all short links from MongoDB
router.get('/shortlinks', checkPermissions('manageShortLinks'), (req, res) => {
    const {
      tenancy
    } = req.session.user;
  
    db.ShortLinks.find({
        tenancies: tenancy
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving short links:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get short link by ID from MongoDB
  router.get('/shortlinks/:id', checkPermissions('manageShortLinks'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      tenancy
    } = req.session.user;
  
    db.ShortLinks.findOne({
        _id: id,
        tenancies: tenancy
      })
      .then((result) => {
        if (!result) {
          res.status(404).json({
            error: 'Short link not found'
          });
          return;
        }
  
        res.json(result);
      })
      .catch((error) => {
        console.error('Error retrieving short link:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  function alterShortLink(id, description, url, shortUrl, attachedTo, addedBy, addedDate, modifiedBy, modifiedDate, tenancies, userTenancy) {
    return new Promise((resolve, reject) => {
  
      try {
        // Validate the short link data
        validateShortLinkData(description, url, shortUrl);
      } catch (error) {
        reject({
          error: error.message
        });
        return;
      }
  
      // Check if an ID is provided
      if (id) {
        // Update existing entry
        db.ShortLinks.findById(id)
          .then((shortLink) => {
            if (!shortLink) {
              reject({
                error: 'Short link not found'
              });
              return;
            }
  
            // Make sure the ShortLink tenancies include the user tenancy
            if (!shortLink.tenancies.includes(userTenancy)) {
              reject({
                error: 'User tenancy is not included in the ShortLink tenancies'
              });
              return;
            }
  
            // Update the ShortLink with the provided values
            shortLink.description = description;
            shortLink.url = url;
            shortLink.shortUrl = shortUrl;
            shortLink.modifiedBy = modifiedBy;
            shortLink.modifiedDate = modifiedDate;
  
            shortLink.save()
              .then(() => {
                console.log('Short link updated successfully');
                resolve({
                  message: 'Short link updated successfully'
                });
              })
              .catch((error) => {
                console.error('Error updating short link:', error);
                reject({
                  error: 'Error updating short link'
                });
              });
          })
          .catch((error) => {
            console.error('Error finding short link:', error);
            reject({
              error: 'Error finding short link'
            });
          });
      } else {
        // Check if the ShortLink already exists for the tenancy
        db.ShortLinks.findOne({
            shortUrl,
            tenancies: tenancies
          })
          .then((existingShortLink) => {
            if (existingShortLink) {
              reject({
                error: 'Short link already exists for the tenancy'
              });
              return;
            }
  
            // Create a new ShortLink entry
  
            const newShortLink = new ShortLinks({
              description,
              url,
              shortUrl,
              attachedTo,
              addedBy,
              addedDate,
              tenancies
            });
            newShortLink.save()
              .then(() => {
                console.log('Short link created successfully');
                resolve({
                  message: 'Short link created successfully'
                });
              })
              .catch((error) => {
                console.error('Error creating short link:', error);
                reject({
                  error: 'Error creating short link'
                });
              });
          })
          .catch((error) => {
            console.error('Error finding existing short link:', error);
            reject({
              error: 'Error finding existing short link'
            });
          });
      }
    });
  }
  
  // Function to validate short link data
  function validateShortLinkData(description, url, shortUrl) {
    if (!url) {
      throw new Error('URL is required');
    }
  
    // Check if the URL is valid
    try {
      new URL(url);
    } catch (error) {
      throw new Error('Invalid URL');
    }
  
    if (!shortUrl) {
      throw new Error('Short URL is required');
    }
  
    if (shortUrl.length < 3) {
      throw new Error('Short URL must be at least 3 characters long');
    }
  
    if (shortUrl.length > 20) {
      throw new Error('Short URL must be at most 20 characters long');
    }
  
    if (!/^[a-zA-Z0-9]+$/.test(shortUrl)) {
      throw new Error('Short URL must contain only letters and numbers');
    }
  
    if (description && description.length > 100) {
      throw new Error('Description must be at most 100 characters long');
    }
  
    return true;
  }
  
  // Add short link to MongoDB
  router.post('/shortlinks', checkPermissions('manageShortLinks'), (req, res) => {
    const {
      description,
      url,
      shortUrl
    } = req.body;
    const {
      userId,
      tenancy
    } = req.session.user;
  
    const addedDate = Date.now();
  
    // use the alterShortLink function to add the short link
    alterShortLink(null, description, url, shortUrl, null, userId, addedDate, null, null, tenancy, null)
      .then((message) => {
        res.status(200).json({
          message
        });
      })
      .catch((error) => {
        console.error('Error creating short link:', error);
        res.status(500).json({
          error
        });
      });
  });
  
  
  // Edit short link in MongoDB
  router.put('/shortlinks/:id', checkPermissions('manageShortLinks'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      description,
      url,
      shortUrl
    } = req.body;
    const {
      userId,
      tenancy
    } = req.session.user;
  
    const modifiedDate = Date.now();
  
    // use the alterShortLink function to edit the short link
    alterShortLink(id, description, url, shortUrl, null, null, null, userId, modifiedDate, null, tenancy)
      .then((message) => {
        res.status(200).json({
          message
        });
      })
      .catch((error) => {
        console.error('Error editing short link:', error);
        res.status(500).json({
          error
        });
      });
  });
  
  // Get all short link hits from MongoDB
  // This table contains all hits of all short links and this is a very large table.
  // Therefore, it is not recommended to use this endpoint.
  // Instead, use the endpoint below to get the hits of a specific short link.
  
  router.get('/shortlinks/hits', checkPermissions('manageShortLinks'), (req, res) => {
    db.ShortLinksHits.find({
        tenancies: req.session.user.tenancy
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving short link hits:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get short link hits by short link ID from MongoDB
  router.get('/shortlinks/:id/hits', checkPermissions('manageShortLinks'), (req, res) => {
    const {
      id
    } = req.params;
  
    db.ShortLinksHits.find({
        id: id,
        tenancies: req.session.user.tenancy
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving short link hits:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get short link statistics by short link ID from MongoDB
  router.get('/shortlinks/:id/statistics', checkPermissions('manageShortLinks'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      tenancy
    } = req.session.user;
  
    db.ShortLinks.findById(id)
      .then((shortLink) => {
        if (!shortLink) {
          throw new Error('Short link not found');
        }
        if (!shortLink.tenancies.includes(tenancy)) {
          throw new Error('Unauthorized');
        }
        return db.ShortLinksStatistics.find({
          shortLink: id,
          tenancies: tenancy
        });
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving short link statistics:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Delete short link from MongoDB
  router.delete('/shortlinks/:id', checkPermissions('manageShortLinks'), (req, res) => {
    const {
      id
    } = req.params;
    const {
      tenancy
    } = req.session.user;
  
    db.ShortLinks.findById(id)
      .then((shortLink) => {
        if (!shortLink) {
          throw new Error('Short link not found');
        }
        if (!shortLink.tenancies.includes(tenancy)) {
          throw new Error('Unauthorized');
        }
        if (shortLink.attachedTo) {
          throw new Error('Short link is attached to an object and cannot be deleted');
        }
        return db.ShortLinks.findByIdAndDelete(id);
      })
      .then(() => {
        res.json({
          success: true,
          message: 'Short link deleted'
        });
        console.log('Short link deleted');
      })
      .catch((error) => {
        console.error('Error deleting short link:', error);
        if (error.message === 'Short link not found' || error.message === 'Unauthorized') {
          res.status(404).json({
            error: error.message
          });
        } else if (error.message === 'Short link has an attached object and cannot be deleted') {
          res.status(400).json({
            error: error.message
          });
        } else {
          res.status(500).json({
            error: 'Internal server error'
          });
        }
      });
  });
  
module.exports = router;
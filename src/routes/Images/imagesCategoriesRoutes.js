const express = require('express');
const router = express.Router();
const logger = require('../../modules/winston.js');
const db = require('../../db/database.js');

const checkPermissions = require('../../middlewares/permissionMiddleware.js');


// Get all images categories from MongoDB
router.get('/', checkPermissions('manageImages' || 'manageImagesCategories'), (req, res) => {
    const userTenancy = req.session.user.tenancy;
  
    db.ImagesCategories.find({
        tenancies: userTenancy
      })
      .then((results) => {
        res.json(results);
      })
      .catch((error) => {
        console.error('Error retrieving images categories:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Insert image category into MongoDB
  router.post('/add', checkPermissions('manageImagesCategories'), (req, res) => {
    const {
      name,
      description,
      image,
      active
    } = req.body;
    const {
      userId,
      tenancy
    } = req.session.user;
  
    const imagesCategories = new db.ImagesCategories({
      addedBy: userId,
      name: name,
      description: description,
      image: image,
      active: active,
      addedDate: Date.now(),
      tenancies: tenancy // Add tenancy field
    });
  
    imagesCategories.save()
      .then(() => {
        res.status(200).json({
          success: 'Image category added successfully'
        });
      })
      .catch((error) => {
        console.error('Error inserting image category:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Duplicate image category
  router.post('/:id/duplicate', checkPermissions('manageImagesCategories'), (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id
    } = req.params;
  
    db.ImagesCategories.findOne({
        _id: id,
        tenancies: req.session.user.tenancy // Add condition for tenancy
      })
      .then((imagesCategories) => {
        if (!imagesCategories) {
          throw new Error('Image category not found');
        } else {
          const newImagesCategories = new db.ImagesCategories({
            addedBy: userId,
            name: imagesCategories.name + ' (Copy)',
            description: imagesCategories.description,
            image: imagesCategories.image,
            active: imagesCategories.active,
            addedDate: Date.now(),
            tenancies: req.session.user.tenancy // Set tenancy for duplicated object
          });
  
          newImagesCategories.save()
            .then(() => {
              res.status(200).json({
                success: 'Image category duplicated successfully'
              });
            })
            .catch((error) => {
              console.error('Error duplicating image category:', error);
              res.status(500).json({
                error: 'Internal server error'
              });
            });
        }
      })
      .catch((error) => {
        console.error('Error duplicating image category:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Edit image category
  router.put('/:id', checkPermissions('manageImagesCategories'), (req, res) => {
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
  
    db.ImagesCategories.findOneAndUpdate({
          _id: id,
          tenancies: req.session.user.tenancy
        }, // Add condition for tenancy
        {
          name,
          description,
          image,
          active,
          modifiedDate: Date.now(),
          modifiedBy: userId
        }, {
          new: true
        } // Return the updated document
      )
      .then((updatedImageCategory) => {
        if (!updatedImageCategory) {
          return res.status(404).json({
            error: 'Image category not found'
          });
        }
  
        res.status(200).json({
          success: 'Image category updated',
          imageCategory: updatedImageCategory
        });
      })
      .catch((error) => {
        console.error('Error editing image category:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Delete image category from MongoDB by ID
  router.delete('/:id', checkPermissions('manageImagesCategories'), (req, res) => {
    const imageCategoryId = req.params.id;
  
    db.ImagesCategories.findOneAndDelete({
        _id: imageCategoryId,
        tenancies: req.session.user.tenancy
      })
      .then((deletedImageCategory) => {
        if (!deletedImageCategory) {
          return res.status(404).json({
            error: 'Image category not found'
          });
        }
  
        res.json({
          message: 'Image category deleted successfully'
        });
      })
      .catch((error) => {
        console.error('Error deleting image category:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get the category of an image by ID
  router.get('/images/:id/category', checkPermissions('manageImages'), (req, res) => {
    const id = req.params.id;
  
    db.Images.findById(id)
      .populate({
        path: 'category',
        match: {
          tenancies: req.session.user.tenancy
        } // Filter by tenancy
      })
      .then((image) => {
        if (!image) {
          return res.status(404).json({
            error: 'Image not found'
          });
        }
  
        if (!image.category) {
          return res.status(404).json({
            error: 'Category not found for the image'
          });
        }
  
        res.json(image.category);
      })
      .catch((error) => {
        console.error('Error retrieving image category:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

module.exports = router;
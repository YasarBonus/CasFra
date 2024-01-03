const express = require('express');
const router = express.Router();
const logger = require('../../modules/winston.js');
const db = require('../../db/database.js');

const checkPermissions = require('../../middlewares/permissionMiddleware.js');

const multer = require('multer');
const fs = require('fs');

// Get all images from MongoDB
router.get('/images', checkPermissions('manageImages'), (req, res) => {
    db.Images.find({
        tenancies: req.session.user.tenancy
      })
      .then((results) => {
        const updatedResults = results.map((image) => {
          return {
            ...image._doc,
            imageUrl: `/img/images/${image.filename}`
          };
        });
        res.json(updatedResults);
      })
      .catch((error) => {
        console.error('Error retrieving images:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Get all images of a specific category
  router.get('/images/categories/:categoryId/images', checkPermissions('manageImages'), (req, res) => {
    const categoryId = req.params.categoryId;
    const userTenancy = req.session.user.tenancy;
  
    db.Images.find({
        category: categoryId,
        tenancies: userTenancy
      })
      .then((results) => {
        const updatedResults = results.map((image) => {
          return {
            _id: image._id,
            name: image.name,
            imageUrl: image.imageUrl,
          };
        });
        res.json(updatedResults);
      })
      .catch((error) => {
        console.error('Error retrieving images of category:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Set up multer storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/img/images'); // Set the destination folder for uploaded images
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop()); // Set the filename for the uploaded image
    }
  });
  
  // Create multer upload instance
  const upload = multer({
    storage: storage
  });
  
  // Upload image and save it to the database
  router.post('/images', checkPermissions('manageImages'), upload.single('image'), (req, res) => {
    const image = req.file;
  
    if (!image) {
      return res.status(400).json({
        error: 'No image file provided'
      });
    }
  
    // Save the image details to the database
    const newImage = new Images({
      filename: image.filename,
      originalname: image.originalname,
      name: image.originalname,
      mimetype: image.mimetype,
      size: image.size,
      addedDate: Date.now(),
      categoryId: req.body.categoryId,
      addedBy: req.session.user.userId,
      category: req.body.categoryId,
      tenancies: req.session.user.tenancy // Add tenancies field
    });
  
    newImage.save()
      .then((savedImage) => {
        setImageUrl(savedImage._id);
        res.json({
          message: 'Image uploaded and saved successfully',
          image: savedImage
        });
      })
      .catch((error) => {
        console.error('Error saving image:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Edit image
  router.put('/images/:id', checkPermissions('manageImages'), (req, res) => {
    const {
      userId
    } = req.session.user;
    const {
      id
    } = req.params;
    const {
      name,
      description,
      priority,
      active,
      category
    } = req.body;
  
    db.Images.findOne({
        _id: id,
        tenancies: req.session.user.tenancy
      }) // Add condition for tenancies
      .then((image) => {
        if (!image) {
          res.status(404).json({
            error: 'Image not found'
          });
        } else {
          image.name = name;
          image.description = description;
          image.priority = priority;
          image.active = active;
          image.modifiedDate = Date.now();
          image.modifiedBy = userId;
          image.category = category;
  
          image.save()
            .then(() => {
              res.status(200).json({
                message: 'Image ' + image.name + ' edited successfully'
              });
            })
            .catch((error) => {
              console.error('Error editing image:', error);
              res.status(500).json({
                error: 'Internal server error'
              });
            });
        }
      })
      .catch((error) => {
        console.error('Error editing image:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });
  
  // Delete image from MongoDB and from the file system by ID
  router.delete('/images/:id', checkPermissions('manageImages'), (req, res) => {
    const id = req.params.id;
    const {
      tenancy
    } = req.session.user;
  
    db.Images.findOneAndDelete({
        _id: id,
        tenancies: tenancy
      })
      .then((deletedImage) => {
        if (!deletedImage) {
          return res.status(404).json({
            error: 'Image not found'
          });
        }
  
        // Delete the image from the file system
        fs.unlinkSync(`public/img/images/${deletedImage.filename}`);
  
        res.json({
          message: 'Image deleted successfully'
        });
      })
      .catch((error) => {
        console.error('Error deleting image:', error);
        res.status(500).json({
          error: 'Internal server error'
        });
      });
  });

module.exports = router;
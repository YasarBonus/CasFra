const express = require('express');
const router = express.Router();
const logger = require('../../modules/winston.js');
const db = require('../../db/database.js');

const Minio = require('minio');

// Erstellen Sie eine neue Instanz des MinIO-Clients
const minioClient = new Minio.Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: 'casfra-api-images',
  secretKey: 'Shohjahr7IJoh7OmeeBaec9ahlaiyi'
});

const checkPermissions = require('../../middlewares/permissionMiddleware.js');

// Get all images from MongoDB
router.get('/', checkPermissions('manageImages'), (req, res) => {
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
router.get('/categories/:categoryId/images', checkPermissions('manageImages'), (req, res) => {
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

// Upload images
// 1. upload image to Minio
// 2. save image data to MongoDB
// 3. delete image from Minio if MongoDB save fails

// 1. upload image to Minio
router.post('/', checkPermissions('manageImages'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    name,
    description,
    priority,
    active,
    category,
  } = req.body;
  const file = req.files.file;

  // 1. upload image to Minio
  minioClient.putObject('casfra-images', file.name, file.data, function (err, etag) {
    if (err) {
      console.error('Error uploading image to Minio:', err);
      res.status(500).json({
        error: 'Internal server error'
      });
    } else {
      // 2. save image data to MongoDB
      const images = new db.Images({
        name: name,
        filename: file.name,
        originalname: file.originalname,
        priority: priority,
        size: file.size,
        mimetype: file.mimetype,
        description: description,
        addedDate: Date.now(),
        addedBy: userId,
        category: category,
        active: active,
        tenancies: req.session.user.tenancy
      });

      images.save()
        .then(() => {
          res.status(200).json({
            message: 'Image ' + images.name + ' uploaded successfully'
          });
        })
        .catch((error) => {
          console.error('Error saving image to MongoDB:', error);
          res.status(500).json({
            error: 'Internal server error'
          });
          // 3. delete image from Minio if MongoDB save fails
          minioClient.removeObject('images', file.name, function (err) {
            if (err) {
              console.error('Error deleting image from Minio:', err);
            } else {
              console.log('Image ' + file.name + ' deleted from Minio');
            }
          });
        });
    }
  });
});


// Edit image
router.put('/:id', checkPermissions('manageImages'), (req, res) => {
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

module.exports = router;
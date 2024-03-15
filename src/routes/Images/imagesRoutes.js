const express = require('express');
const router = express.Router();
const logger = require('../../modules/winston.js');
const db = require('../../db/database.js');

const Minio = require('minio');

const dotenv = require('dotenv');

dotenv.config();

// Erstellen Sie eine neue Instanz des MinIO-Clients
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

const checkPermissions = require('../../middlewares/permissionMiddleware.js');
const Client = require('ssh2-sftp-client');

// Get all images from MongoDB
router.get('/', checkPermissions('manageImages'), (req, res) => {
  const { tenancy, userId } = req.session.user;
  const query = tenancy ? { tenancies: tenancy } : { users: userId };

  db.Images.find(query)
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
// 1. upload image to SFTP
// 2. save image data to MongoDB
// 3. delete image from SFTP if MongoDB save fails

const sftp = new Client();

// 1. upload image to SFTP
router.post('/', checkPermissions('manageImages'), async (req, res) => {
  const { userId, tenancy } = req.session.user;
  const { description, active, category } = req.body;
  let name = req.body.name;
  const file = req.files.image;

  if (!name) {
    name = file.name;
  }

  file.originalname = file.name;

  // generate new name for the image: timestamp_randomnumber.mime
  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 10000000000);
  const newFilename = timestamp + '_' + randomNumber + '.' + file.originalname.split('.').pop();
  file.name = newFilename;

  try {
    await sftp.connect({
      host: process.env.CDN_SFTP_HOST,
      port: parseInt(process.env.CDN_SFTP_PORT),
      username: process.env.CDN_SFTP_USERNAME,
      privateKey: process.env.CDN_SSH_PRIVATE_KEY,
      passphrase: process.env.CDN_SSH_PASSPHRASE || undefined,
      password: process.env.CDN_SFTP_PASSWORD || undefined
    });

    await sftp.put(file.data, process.env.CDN_SFTP_DESTINATION_PATH + file.name);

    // 2. save image data to MongoDB
    const images = new db.Images({
      name: name,
      filename: file.name,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      description: description,
      addedDate: Date.now(),
      addedBy: userId,
      category: category,
      active: active,
      tenancies: tenancy ? [tenancy] : [],
      users: tenancy ? [] : [userId],
      image_url: process.env.CDN_URL + file.name
    });

    await images.save();

    res.status(200).json({
      message: 'Image ' + images.originalname + ' uploaded successfully: ' + images.filename
    });
  } catch (error) {
    console.error('Error uploading image to SFTP:', error);
    res.status(500).json({
      error: 'Internal server error'
    });

    // 3. delete image from SFTP if MongoDB save fails
    try {
      await sftp.delete(process.env.CDN_SFTP_DESTINATION_PATH + file.name);
      console.log('Image ' + file.name + ' deleted from SFTP');
    } catch (error) {
      console.error('Error deleting image from SFTP:', error);
    }
  } finally {
    sftp.end();
  }
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
      ...(req.session.user.tenancy ? { tenancies: req.session.user.tenancy } : { users: req.session.user.userId })
    }) 
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

// Delete image from MongoDB and SFTP storage
router.delete('/:id', checkPermissions('manageImages'), async (req, res) => {
  const { id } = req.params;

  try {
    const image = await db.Images.findOne({
      _id: id,
      ...(req.session.user.tenancy ? { tenancies: req.session.user.tenancy } : { users: req.session.user.userId })
    });

    if (!image) {
      res.status(404).json({
        error: 'Image not found'
      });
    } else {
      const sftp = new Client();
      await sftp.connect({
        host: process.env.CDN_SFTP_HOST,
        port: parseInt(process.env.CDN_SFTP_PORT),
        username: process.env.CDN_SFTP_USERNAME,
        privateKey: process.env.CDN_SSH_PRIVATE_KEY || undefined,
        passphrase: process.env.CDN_SSH_PASSPHRASE || undefined,
        password: process.env.CDN_SFTP_PASSWORD || undefined
      });

      // Delete image from SFTP
      await sftp.delete(process.env.CDN_SFTP_DESTINATION_PATH + image.filename);
      console.log('Image ' + image.filename + ' deleted from SFTP');

      // Delete image from MongoDB
      await db.Images.deleteOne({
        _id: id
      });

      res.status(200).json({
        message: 'Image ' + image.name + ' deleted successfully'
      });

      sftp.end();
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;
// ?? war plötzlich hier const router = require("../authRoutes");
const express = require("express");
const router = express.Router();
const logger = require("../../modules/winston.js");
const db = require("../../db/database.js");
const checkPermissions = require("../../middlewares/permissionMiddleware.js");

// Get count of all casino providers from MongoDB
router.get("/count", checkPermissions("manageCasinos"), (req, res) => {
  db.CasinoProvider.countDocuments({
    tenancies: {
      $in: [req.session.user.tenancy],
    },
  })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error("Error retrieving casino providers count:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

// Get all casino providers from MongoDB
router.get("/", checkPermissions("manageCasinos"), (req, res) => {
  db.CasinoProvider.find({
    tenancies: req.session.user.tenancy,
  })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error("Error retrieving casino providers:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

// Insert casino provider into MongoDB
router.post("/", checkPermissions("manageCasinos"), (req, res) => {
  const { name, description, image, active } = req.body;
  const { userId, tenancy } = req.session.user;

  const casinoProvider = new db.CasinoProvider({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    active: active,
    addedDate: Date.now(),
    tenancies: [tenancy],
  });

  casinoProvider
    .save()
    .then(() => {
      res.status(201).json(casinoProvider);
    })
    .catch((error) => {
      console.error("Error inserting casino provider:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

// Get details of a specific casino provider
router.get("/:id", checkPermissions("manageCasinos"), (req, res) => {
  const { id } = req.params;

  db.CasinoProvider.findOne({
    _id: id,
    tenancies: req.session.user.tenancy,
  })
    .then((casinoProvider) => {
      if (!casinoProvider) {
        // Handle not found case
      }
      res.json(casinoProvider);
    })
    .catch((error) => {
      console.error("Error retrieving casino provider:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

// Duplicate casino provider
router.post("/:id/duplicate", checkPermissions("manageCasinos"), (req, res) => {
  const { userId, tenancy } = req.session.user;
  const { id } = req.params;

  db.CasinoProvider.findOne({
    _id: id,
    tenancies: tenancy,
  })
    .then((casinoProviders) => {
      if (!casinoProviders) {
        throw new Error("Casino provider not found");
      } else {
        const newCasinoProviders = new db.CasinoProvider({
          addedBy: userId,
          name: casinoProviders.name + " (Copy)",
          description: casinoProviders.description,
          image: casinoProviders.image,
          active: casinoProviders.active,
          addedDate: Date.now(),
        });

        newCasinoProviders
          .save()
          .then(() => {
            res.redirect("/dashboard");
          })
          .catch((error) => {
            console.error("Error duplicating casino provider:", error);
            res.status(500).json({
              error: "Internal server error",
            });
          });
      }
    })
    .catch((error) => {
      console.error("Error duplicating casino provider:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

// Edit casino provider
router.put("/:id", checkPermissions("manageCasinos"), (req, res) => {
  const { userId, tenancy } = req.session.user;
  const { id } = req.params;
  const { name, description, image, active } = req.body;

  db.CasinoProvider.findOneAndUpdate(
    {
      _id: id,
      tenancies: tenancy,
    },
    {
      name,
      description,
      image,
      active,
    },
    {
      modifiedBy: userId,
      modifiedDate: Date.now(),
    }
  )
    .then((updatedCasinoProviders) => {
      if (!updatedCasinoProviders) {
        throw new Error("Casino provider not found");
      }
      res.json(updatedCasinoProviders);
      console.log("Casino provider updated: " + updatedCasinoProviders.name);
    })
    .catch((error) => {
      console.error("Error updating casino provider:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

// Delete casino provider
router.delete("/:id", checkPermissions("manageCasinos"), (req, res) => {
  const { id } = req.params;

  const { tenancy } = req.session.user;

  db.CasinoProvider.findOneAndDelete({
    _id: id,
    tenancies: tenancy,
  })
    .then((deletedCasinoProvider) => {
      if (!deletedCasinoProvider) {
        throw new Error("Casino provider not found");
      }
      res.json(deletedCasinoProvider);
      console.log("Casino provider deleted: " + deletedCasinoProvider.name);
    })
    .catch((error) => {
      console.error("Error deleting casino provider:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

module.exports = router;

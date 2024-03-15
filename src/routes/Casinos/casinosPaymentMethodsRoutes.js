const express = require("express");
const router = express.Router();
const logger = require("../../modules/winston.js");
const db = require("../../db/database.js");
const checkPermissions = require("../../middlewares/permissionMiddleware.js");

// Get all casino payment methods from MongoDB
router.get("/", checkPermissions("manageCasinos"), (req, res) => {
  const userTenancy = req.session.user.tenancy;
  db.CasinoPaymentMethods.find({
    tenancies: userTenancy,
  })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error("Error retrieving casino payment methods:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

// Get count of all casino payment methods from MongoDB
router.get("/count", checkPermissions("manageCasinos"), (req, res) => {
  const userTenancy = req.session.user.tenancy;
  db.CasinoPaymentMethods.countDocuments({
    tenancies: userTenancy,
  })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error("Error retrieving casino payment methods count:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

// Get details of a specific casino payment method
router.get("/:id", checkPermissions("manageCasinos"), (req, res) => {
  const { id } = req.params;
  const userTenancy = req.session.user.tenancy;

  db.CasinoPaymentMethods.findOne({
    _id: id,
    tenancies: userTenancy,
  })
    .then((casinoPaymentMethods) => {
      if (!casinoPaymentMethods) {
        return res.status(404).json({
          error: "Casino payment method not found",
        });
      }

      res.json(casinoPaymentMethods);
    })
    .catch((error) => {
      console.error("Error retrieving casino payment method:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

// Insert casino payment method into MongoDB
router.post("/", checkPermissions("manageCasinos"), (req, res) => {
  const { name, description, image, priority, active } = req.body;
  const { userId } = req.session.user;

  const casinoPaymentMethods = new db.CasinoPaymentMethods({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    priority: priority,
    active: active,
    addedDate: Date.now(),
    tenancies: [req.session.user.tenancy], // Add the user's tenancy to the tenancies array
  });

  casinoPaymentMethods
    .save()
    .then(() => {
      res.status(200).json({
        success: "Casino payment method inserted successfully",
      });
    })
    .catch((error) => {
      console.error("Error inserting casino payment method:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

// Edit casino payment method
router.put("/:id", checkPermissions("manageCasinos"), (req, res) => {
  const { userId } = req.session.user;
  const { id } = req.params;
  const { name, description, image, priority, active } = req.body;

  db.CasinoPaymentMethods.findOneAndUpdate(
    {
      _id: id,
      tenancies: req.session.user.tenancy, // Add the condition to check tenancies
    },
    {
      name,
      description,
      image,
      priority,
      active,
    },
    {
      new: true,
    }
  )
    .then((casinoPaymentMethods) => {
      if (!casinoPaymentMethods) {
        throw new Error("Casino payment method not found");
      } else {
        res.redirect("/dashboard");
      }
    })
    .catch((error) => {
      console.error("Error updating casino payment method:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

// Duplicate casino payment method
router.post("/:id/duplicate", checkPermissions("manageCasinos"), (req, res) => {
  const { userId } = req.session.user;
  const { id } = req.params;

  db.CasinoPaymentMethods.findOne({
    _id: id,
    tenancies: req.session.user.tenancy, // Add the condition to check tenancies
  })
    .then((casinoPaymentMethods) => {
      if (!casinoPaymentMethods) {
        throw new Error("Casino payment method not found");
      } else {
        newPriority = generateRandomPriority();
        const newCasinoPaymentMethods = new db.CasinoPaymentMethods({
          addedBy: userId,
          name: casinoPaymentMethods.name + " (Copy)",
          description: casinoPaymentMethods.description,
          image: casinoPaymentMethods.image,
          priority: newPriority,
          active: casinoPaymentMethods.active,
          addedDate: Date.now(),
          tenancies: [req.session.user.tenancy], // Add the user's tenancy to the tenancies array
        });

        newCasinoPaymentMethods
          .save()
          .then(() => {
            res.status(200).json({
              success: "Casino payment method duplicated successfully",
            });
          })
          .catch((error) => {
            console.error("Error duplicating casino payment method:", error);
            res.status(500).json({
              error: "Internal server error",
            });
          });
      }
    })
    .catch((error) => {
      console.error("Error duplicating casino payment method:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

// Delete casino payment method
router.delete("/:id", checkPermissions("manageCasinos"), (req, res) => {
  const { id } = req.params;

  db.CasinoPaymentMethods.findOneAndDelete({
    _id: id,
    tenancies: req.session.user.tenancy, // Add the condition to check tenancies
  })
    .then((deletedCasinoPaymentMethods) => {
      if (!deletedCasinoPaymentMethods) {
        throw new Error("Casino payment method not found");
      }
      res.json(deletedCasinoPaymentMethods);
      console.log("Casino payment method deleted: " + deletedCasinoPaymentMethods.name);
    })
    .catch((error) => {
      console.error("Error deleting casino payment method:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    });
});

module.exports = router;

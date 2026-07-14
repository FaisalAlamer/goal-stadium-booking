const express = require("express");
const multer = require("multer");
const path = require("path");
const Stadium = require("../models/Stadium");
const Slot = require("../models/Slot");
const Reservation = require("../models/Reservation");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Set up multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage: storage });

// GET /api/stadiums - Get all stadiums (with optional filters)
router.get("/", async function (req, res) {
  try {
    const location = req.query.location;
    const name = req.query.name;
    const date = req.query.date;
    const time = req.query.time;

    // Build the query filter
    var filter = {};
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    var stadiums = await Stadium.find(filter).lean();

    // Convert _id to id for frontend compatibility
    for (var i = 0; i < stadiums.length; i++) {
      stadiums[i].id = stadiums[i]._id.toString();
    }

    // Filter by date/time slot availability
    if (date || time) {
      var available = [];
      for (var j = 0; j < stadiums.length; j++) {
        var stadiumId = stadiums[j].id;
        // Build slot query
        var slotFilter = { stadiumId: stadiumId, isReserved: false };
        if (date) slotFilter.date = date;

        var slots = await Slot.find(slotFilter).lean();
        var hasSlot = false;
        for (var k = 0; k < slots.length; k++) {
          if (time && slots[k].startTime > time) continue;
          if (time && slots[k].endTime <= time) continue;
          hasSlot = true;
          break;
        }
        if (hasSlot) available.push(stadiums[j]);
      }
      stadiums = available;
    }

    res.json(stadiums);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/stadiums - Create a new stadium (owner only)
router.post(
  "/",
  authMiddleware.auth,
  upload.array("photos", 5),
  async function (req, res) {
    try {
      if (req.user.role !== "owner") {
        return res.status(403).json({ message: "Only owners can add stadiums" });
      }

      const name = req.body.name;
      const description = req.body.description || "";
      const location = req.body.location;
      const facilities = req.body.facilities || "";

      if (!name || !location) {
        return res
          .status(400)
          .json({ message: "Name and location are required" });
      }

      const facilitiesList = facilities.split(",").map(function (f) {
        return f.trim();
      });

      const photos = [];
      if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
          photos.push(req.files[i].filename);
        }
      }

      const stadium = await Stadium.create({
        ownerId: req.user.id,
        name: name,
        description: description,
        location: location,
        facilities: facilitiesList,
        photos: photos,
      });

      var result = stadium.toObject();
      result.id = result._id.toString();

      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// GET /api/stadiums/owner/my - Get stadiums owned by the logged in owner
router.get("/owner/my", authMiddleware.auth, async function (req, res) {
  try {
    var stadiums = await Stadium.find({ ownerId: req.user.id }).lean();

    for (var i = 0; i < stadiums.length; i++) {
      stadiums[i].id = stadiums[i]._id.toString();
    }

    res.json(stadiums);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/stadiums/:id - Get one stadium by its ID
router.get("/:id", async function (req, res) {
  try {
    const stadium = await Stadium.findById(req.params.id).lean();

    if (!stadium) {
      return res.status(404).json({ message: "Stadium not found" });
    }

    // Find the owner's name
    var ownerName = "Unknown";
    const owner = await User.findById(stadium.ownerId);
    if (owner) {
      ownerName = owner.name;
    }

    res.json({
      id: stadium._id.toString(),
      ownerId: stadium.ownerId,
      ownerName: ownerName,
      name: stadium.name,
      description: stadium.description,
      location: stadium.location,
      facilities: stadium.facilities,
      photos: stadium.photos,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/stadiums/:id - Edit a stadium (owner only)
router.put('/:id', authMiddleware.auth, upload.array('photos', 10), async function(req, res) {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can edit stadiums' });
    }

    var stadium = await Stadium.findById(req.params.id);

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'This is not your stadium' });
    }

    // Update fields
    if (req.body.name) stadium.name = req.body.name;
    if (req.body.description !== undefined) stadium.description = req.body.description;
    if (req.body.location) stadium.location = req.body.location;
    if (req.body.facilities) {
      stadium.facilities = req.body.facilities.split(',').map(function(f) { return f.trim(); });
    }

    // Handle photos: keep selected existing ones + append new uploads
    var keepPhotos = [];
    if (req.body.keepPhotos) {
      keepPhotos = JSON.parse(req.body.keepPhotos);
    }

    var newPhotos = [];
    if (req.files && req.files.length > 0) {
      for (var i = 0; i < req.files.length; i++) {
        newPhotos.push(req.files[i].filename);
      }
    }

    // If keepPhotos was sent, use it as the base and append new ones
    if (req.body.keepPhotos) {
      stadium.photos = keepPhotos.concat(newPhotos);
    } else if (newPhotos.length > 0) {
      // Old behavior: if no keepPhotos field, replace all
      stadium.photos = newPhotos;
    }

    await stadium.save();

    var result = stadium.toObject();
    result.id = result._id.toString();

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/stadiums/:id - Delete a stadium (owner only)
router.delete('/:id', authMiddleware.auth, async function(req, res) {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can delete stadiums' });
    }

    var stadium = await Stadium.findById(req.params.id);

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'This is not your stadium' });
    }

    // Delete all slots and reservations for this stadium
    await Slot.deleteMany({ stadiumId: req.params.id });
    await Reservation.deleteMany({ stadiumId: req.params.id });
    await Stadium.findByIdAndDelete(req.params.id);

    res.json({ message: 'Stadium deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

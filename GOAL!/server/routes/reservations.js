const express = require("express");
const Slot = require("../models/Slot");
const Stadium = require("../models/Stadium");
const Reservation = require("../models/Reservation");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// POST /api/reservations - Book a slot
router.post("/", authMiddleware.auth, async function (req, res) {
  try {
    var slotId = req.body.slotId;
    var stadiumId = req.body.stadiumId;

    // Find the slot
    var slot = await Slot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Check if slot is already taken
    if (slot.isReserved) {
      return res.status(400).json({ message: "This slot is already booked" });
    }

    // Mark the slot as reserved
    slot.isReserved = true;
    slot.reservedBy = req.user.id;
    await slot.save();

    // Find stadium name
    var stadiumName = "";
    var stadium = await Stadium.findById(stadiumId);
    if (stadium) {
      stadiumName = stadium.name;
    }

    // Create the reservation record
    var reservation = await Reservation.create({
      userId: req.user.id,
      stadiumId: stadiumId,
      slotId: slotId,
      stadiumName: stadiumName,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
      status: "confirmed",
    });

    var result = reservation.toObject();
    result.id = result._id.toString();

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reservations/my - Get my reservations
router.get("/my", authMiddleware.auth, async function (req, res) {
  try {
    var reservations = await Reservation.find({ userId: req.user.id }).lean();

    for (var i = 0; i < reservations.length; i++) {
      reservations[i].id = reservations[i]._id.toString();
    }

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/reservations/:id - Cancel a reservation
router.delete("/:id", authMiddleware.auth, async function (req, res) {
  try {
    var reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Make sure it belongs to this user
    if (reservation.userId !== req.user.id) {
      return res.status(403).json({ message: "This is not your reservation" });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: "This reservation is already cancelled" });
    }

    // Mark as cancelled
    reservation.status = "cancelled";
    await reservation.save();

    // Free up the slot
    await Slot.findByIdAndUpdate(reservation.slotId, {
      isReserved: false,
      reservedBy: null
    });

    res.json({ message: "Reservation cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

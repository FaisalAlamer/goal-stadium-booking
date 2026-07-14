const express = require('express');
const Slot = require('../models/Slot');
const Stadium = require('../models/Stadium');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/slots/stadium/:stadiumId - Get all slots for a stadium
router.get('/stadium/:stadiumId', async function(req, res) {
  try {
    var filter = { stadiumId: req.params.stadiumId };
    var date = req.query.date;
    if (date) {
      filter.date = date;
    }

    var slots = await Slot.find(filter).lean();

    for (var i = 0; i < slots.length; i++) {
      slots[i].id = slots[i]._id.toString();
    }

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/slots/stadium/:stadiumId - Add a new time slot (owner only)
router.post('/stadium/:stadiumId', authMiddleware.auth, async function(req, res) {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can add slots' });
    }

    // Check that this owner actually owns this stadium
    const stadium = await Stadium.findById(req.params.stadiumId);

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'This is not your stadium' });
    }

    var date = req.body.date;
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var price = Number(req.body.price) || 0;
    if (price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Date, start time, and end time are required' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    // Check if the slot time has already passed today
    var today = new Date().toISOString().split('T')[0];
    if (date === today) {
      var now = new Date();
      var currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      if (startTime <= currentTime) {
        return res.status(400).json({ message: 'Cannot add a slot in the past. The start time has already passed.' });
      }
    }

    // Check for conflicting slots on the same date
    var existingSlots = await Slot.find({ stadiumId: req.params.stadiumId, date: date }).lean();
    for (var i = 0; i < existingSlots.length; i++) {
      var s = existingSlots[i];
      if (startTime < s.endTime && endTime > s.startTime) {
        return res.status(400).json({ message: 'This time conflicts with an existing slot (' + s.startTime + ' - ' + s.endTime + ')' });
      }
    }

    // Create the slot
    var newSlot = await Slot.create({
      stadiumId: req.params.stadiumId,
      date: date,
      startTime: startTime,
      endTime: endTime,
      price: price,
      isReserved: false,
      reservedBy: null
    });

    var result = newSlot.toObject();
    result.id = result._id.toString();

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/slots/:id - Delete a slot (owner only, only if not reserved)
router.delete('/:id', authMiddleware.auth, async function(req, res) {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can delete slots' });
    }

    var slot = await Slot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.isReserved) {
      return res.status(400).json({ message: 'Cannot delete a reserved slot' });
    }

    await Slot.findByIdAndDelete(req.params.id);

    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

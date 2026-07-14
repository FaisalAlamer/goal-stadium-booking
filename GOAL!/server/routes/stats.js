const express = require('express');
const Slot = require('../models/Slot');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/stats/stadium/:stadiumId - Get stats for a stadium (owner only)
router.get('/stadium/:stadiumId', authMiddleware.auth, async function(req, res) {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can view stats' });
    }

    var stadiumId = req.params.stadiumId;

    // Count slots for this stadium
    var slots = await Slot.find({ stadiumId: stadiumId }).lean();
    var totalSlots = slots.length;
    var reservedSlots = 0;
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].isReserved) {
        reservedSlots++;
      }
    }

    var availableSlots = totalSlots - reservedSlots;

    // Calculate occupancy rate
    var occupancyRate = 0;
    if (totalSlots > 0) {
      occupancyRate = Math.round((reservedSlots / totalSlots) * 100);
    }

    // Get confirmed reservations for this stadium
    var reservations = await Reservation.find({ stadiumId: stadiumId, status: 'confirmed' }).lean();

    // Collect user IDs
    var userIds = [];
    for (var j = 0; j < reservations.length; j++) {
      userIds.push(reservations[j].userId);
    }

    // Fetch users
    var users = await User.find({ _id: { $in: userIds } }).lean();
    var userMap = {};
    for (var k = 0; k < users.length; k++) {
      userMap[users[k]._id.toString()] = users[k].name;
    }

    // Build recent reservations list
    var recentReservations = [];
    for (var m = 0; m < reservations.length; m++) {
      recentReservations.push({
        id: reservations[m]._id.toString(),
        userName: userMap[reservations[m].userId] || 'Unknown',
        date: reservations[m].date,
        startTime: reservations[m].startTime,
        endTime: reservations[m].endTime,
        status: reservations[m].status
      });
    }

    // Only show last 10
    if (recentReservations.length > 10) {
      recentReservations = recentReservations.slice(-10);
    }

    res.json({
      totalSlots: totalSlots,
      reservedSlots: reservedSlots,
      availableSlots: availableSlots,
      occupancyRate: occupancyRate,
      recentReservations: recentReservations
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

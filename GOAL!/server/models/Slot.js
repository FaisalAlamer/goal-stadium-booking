const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  stadiumId: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  price: { type: Number, default: 0 },
  isReserved: { type: Boolean, default: false },
  reservedBy: { type: String, default: null }
});

module.exports = mongoose.model('Slot', slotSchema);

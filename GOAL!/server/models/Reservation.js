const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  stadiumId: { type: String, required: true },
  slotId: { type: String, required: true },
  stadiumName: { type: String, default: '' },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  price: { type: Number, default: 0 },
  status: { type: String, default: 'confirmed' }
});

module.exports = mongoose.model('Reservation', reservationSchema);

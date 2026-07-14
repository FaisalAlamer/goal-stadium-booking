const mongoose = require('mongoose');

const stadiumSchema = new mongoose.Schema({
  ownerId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  location: { type: String, required: true },
  facilities: [String],
  photos: [String]
});

module.exports = mongoose.model('Stadium', stadiumSchema);

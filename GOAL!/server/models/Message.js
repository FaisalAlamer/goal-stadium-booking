const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  stadiumId: { type: String, default: null },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: String, default: function() { return new Date().toISOString(); } }
});

module.exports = mongoose.model('Message', messageSchema);

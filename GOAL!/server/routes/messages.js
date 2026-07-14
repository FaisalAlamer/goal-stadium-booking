const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/messages - Get all messages for the logged in user
router.get('/', authMiddleware.auth, async function(req, res) {
  try {
    var messages = await Message.find({
      $or: [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ]
    }).lean();

    // Collect all unique user IDs we need to look up
    var userIds = {};
    for (var i = 0; i < messages.length; i++) {
      userIds[messages[i].senderId] = true;
      userIds[messages[i].receiverId] = true;
    }

    // Fetch all those users at once
    var users = await User.find({ _id: { $in: Object.keys(userIds) } }).lean();
    var userMap = {};
    for (var j = 0; j < users.length; j++) {
      userMap[users[j]._id.toString()] = users[j].name;
    }

    // Build the response
    var result = [];
    for (var k = 0; k < messages.length; k++) {
      var msg = messages[k];
      result.push({
        id: msg._id.toString(),
        senderId: msg.senderId,
        senderName: userMap[msg.senderId] || 'Unknown',
        receiverId: msg.receiverId,
        receiverName: userMap[msg.receiverId] || 'Unknown',
        stadiumId: msg.stadiumId,
        content: msg.content,
        read: msg.read,
        createdAt: msg.createdAt
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/messages - Send a message
router.post('/', authMiddleware.auth, async function(req, res) {
  try {
    var receiverId = req.body.receiverId;
    var content = req.body.content;
    var stadiumId = req.body.stadiumId || null;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: 'Message is too long (max 2000 characters)' });
    }

    var receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    var message = await Message.create({
      senderId: req.user.id,
      receiverId: receiverId,
      stadiumId: stadiumId,
      content: content,
      read: false,
      createdAt: new Date().toISOString()
    });

    var result = message.toObject();
    result.id = result._id.toString();

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/messages/:id/read - Mark a message as read
router.put('/:id/read', authMiddleware.auth, async function(req, res) {
  try {
    var message = await Message.findByIdAndUpdate(req.params.id, { read: true });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

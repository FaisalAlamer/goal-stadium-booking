const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const SECRET = authMiddleware.SECRET;

// POST /api/auth/register - Create a new account
router.post('/register', async function(req, res) {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (role !== 'user' && role !== 'owner') {
      return res.status(400).json({ message: 'Role must be user or owner' });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
      role: role
    });

    // Create a token
    const token = jwt.sign({ id: newUser._id.toString(), email: newUser.email, role: newUser.role }, SECRET);

    res.status(201).json({
      token: token,
      user: { id: newUser._id.toString(), name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login - Log in to existing account
router.post('/login', async function(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Find the user by email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: 'Wrong email or password' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong email or password' });
    }

    // Create token
    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, SECRET);

    res.json({
      token: token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me - Get current logged in user's info
router.get('/me', authMiddleware.auth, async function(req, res) {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  });
});

module.exports = router;

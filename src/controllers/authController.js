const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth');
const authMiddleware = require('../middlewares/auth'); // Does require authentication

const User = require('../models/user');

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

router.post('/register', async (req, res) => {
  try {
    // Encrypting the password before inserting in db
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const contextUser = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    }

    const searchEmail = await User.findByEmail(contextUser.email);

    if (searchEmail.rows[0])
      return res.status(404).send({ error: 'User already exists' });

    const user = await User.create(contextUser);

    // The password does not appear when returning
    user.password = undefined;

    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).send({ error: 'Registration failed' });
  }
});

router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);

  if (!user.rows[0])
    return res.status(400).send({ error: 'User not found' });

  if (!await bcrypt.compare(password, user.rows[0].PASSWORD))
    return res.status(400).send({ error: 'Invalid password' });

  user.rows[0].PASSWORD = undefined;

  res.send({ user: user.rows[0], token: generateToken({ id: user.rows[0].ID }) });
});

router.get('/user', async (req, res) => {
  try {
    const users = await User.find();
    return res.send(users.rows);
  } catch (err) {
    return res.status(400).send({ error: 'Error loading users' });
  }
});

router.get('/user/:id?', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user.rows.length === 0)
      return res.status(404).send({ error: 'User not found' });

    return res.send(user.rows[0]);
  } catch (err) {
    return res.status(400).send({ error: 'Error loading user' });
  }
});

router.delete('/user/:id?', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await User.delete(user.rows[0].ID);
    return res.send();
  } catch (err) {
    return res.status(400).send({ error: 'Error deleting user' });
  }
});

module.exports = app => app.use('/auth', router);
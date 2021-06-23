const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authConfig = require("../config/auth");
const authMiddleware = require("../middlewares/auth");

const User = require("../models/user");

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const createUserData = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      type: req.body.type,
    };

    const searchEmail = await User.findByEmail(createUserData.email);

    if (searchEmail.rows[0])
      return res.status(404).send({ error: "User already exists" });

    const user = await User.create(createUserData);
    // user.password = undefined;

    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).send({ error: "Registration failed" });
  }
});

router.post("/authenticate", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const user = await User.findByEmail(email);

  if (!user.rows[0]) return res.status(400).send({ error: "User not found" });

  if (!(await bcrypt.compare(password, user.rows[0].password)))
    return res.status(400).send({ error: "Invalid password" });

  if (user.rows[0].status === 0)
    return res.status(400).send({ error: "Disabled user" });

  // user.rows[0].PASSWORD = undefined;

  res.send({
    user: user.rows[0],
    token: generateToken({ id: user.rows[0].id }),
  });
});

router.get("/user", async (req, res) => {
  try {
    let { page, limit } = req.query;
    const filter = { page, limit };
    const users = await User.find(filter);

    // for (const user in users.rows) {
    //   users.rows[user].password = undefined;
    // }

    return res.send(users.rows);
  } catch (err) {
    return res.status(400).send({ error: "Error loading users" });
  }
});

router.get("/user/:id?", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    // user.rows[0].password = undefined;

    if (user.rows.length === 0)
      return res.status(404).send({ error: "User not found" });

    return res.send(user.rows[0]);
  } catch (err) {
    return res.status(400).send({ error: "Error loading user" });
  }
});

router.put("/user/:id?", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const updateUserData = {
      id: id,
      name: req.body.name,
      password: hashedPassword,
      type: req.body.type,
    };

    if (
      !updateUserData.name ||
      !updateUserData.password ||
      !updateUserData.type
    )
      return res.status(400).send({ error: "Fill the fields" });

    await User.update(updateUserData);

    return res.send({ updateUserData, message: "User successfully updated" });
  } catch (err) {
    return res.status(400).send({ error: "Update failed" });
  }
});

router.get("/user/status/:id?", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const getStatus = !!user.rows[0].status
      ? (user.rows[0].status = 0)
      : (user.rows[0].status = 1);
    await User.toggleStatus(user.rows[0].id, getStatus);
    return res.send({ message: "User status successfully updated" });
  } catch (err) {
    return res.status(400).send({ error: "Change status failed" });
  }
});

router.delete("/user/:id?", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await User.delete(user.rows[0].id);
    return res.send();
  } catch (err) {
    return res.status(400).send({ error: "Error deleting user" });
  }
});

module.exports = (app) => app.use("/auth", router);

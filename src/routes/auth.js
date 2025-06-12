const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  const { email, pseudo, password } = req.body;
  if (!email || !pseudo || !password)
    return res.status(400).json({ error: 'Missing fields' });

  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, pseudo, password: hashed },
    });

    const token = jwt.sign({ id: user.id, pseudo: user.pseudo }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (e) {
    res.status(400).json({ error: 'Email or pseudo already exists' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, pseudo: user.pseudo }, process.env.JWT_SECRET);
  res.json({ token });
});

module.exports = router;

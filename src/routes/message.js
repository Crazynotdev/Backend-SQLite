const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/send', async (req, res) => {
  const { pseudo, message } = req.body;
  if (!pseudo || !message) return res.status(400).json({ error: 'Missing fields' });

  const user = await prisma.user.findUnique({ where: { pseudo } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  await prisma.message.create({
    data: {
      text: message,
      userId: user.id,
    },
  });

  res.json({ success: true });
});

router.get('/messages', auth, async (req, res) => {
  const messages = await prisma.message.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ messages });
});

module.exports = router;

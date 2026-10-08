require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { connectToDatabase, saveContactMessage } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50kb' }));

// Never serve server-side / private files
const PRIVATE = ['server.js', 'database.js', 'package.json', 'package-lock.json', 'message.json', 'portfolio.db'];
app.use((req, res, next) => {
  const name = path.basename(decodeURIComponent(req.path)).toLowerCase();
  if (PRIVATE.includes(name) || name.startsWith('.') || req.path.includes('node_modules')) {
    return res.status(404).end();
  }
  next();
});
app.use(express.static(__dirname));

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function notifyByEmail({ name, email, message }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO || process.env.EMAIL_USER,
    replyTo: email,
    subject: `Portfolio message from ${name}`,
    text: `${message}\n\n${name} <${email}>`
  });
}

app.post('/api/contact', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim();
  const message = String(req.body?.message || '').trim();

  if (!name || !emailOk(email) || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in a valid name, email and message.' });
  }

  try {
    await saveContactMessage({ name, email, message });
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not save your message. Please try again later.' });
  }

  // Email is a bonus: the message is already saved, so a mail failure doesn't fail the request
  try {
    await notifyByEmail({ name, email, message });
  } catch (error) {
    console.error('Email error:', error.message);
  }

  res.json({ success: true, message: 'Message sent successfully! I will get back to you soon.' });
});

// Any other /api route returns JSON, never an empty body
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Not found.' }));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ success: false, message: 'Server error.' });
});

connectToDatabase()
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB not reachable yet:', error.message));

app.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
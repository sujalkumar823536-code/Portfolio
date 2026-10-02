require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const { saveContactMessage, exportContactMessages } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Portfolio backend is running'
  });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required.'
    });
  }

  try {
    await saveContactMessage({ name, email, message });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.RECIPIENT_EMAIL || process.env.SMTP_USER,
        replyTo: email,
        subject: `Portfolio contact from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <h3>New portfolio message</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      });
    }

    return res.json({
      success: true,
      message: 'Thanks! Your message has been received.'
    });
  } catch (error) {
    console.error('Contact save error:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not save the message right now. Please try again later.'
    });
  }
});

app.get('/message.json', (req, res) => {
  res.sendStatus(404);
});

app.use(express.static(path.join(__dirname)));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }

  return res.sendFile(path.join(__dirname, 'index.html'));
});

async function startServer() {
  await exportContactMessages();

  app.listen(PORT, () => {
    console.log(`Portfolio backend running at http://127.0.0.1:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Could not initialize message export:', error);
  process.exitCode = 1;
});

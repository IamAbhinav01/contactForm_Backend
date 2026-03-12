const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const resend = new Resend(process.env.RESEND_API_KEY);

/* -------------------- Middleware -------------------- */

app.use(
  cors({
    origin: 'https://iamabhinav.onrender.com',
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* -------------------- Health Check -------------------- */

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

/* -------------------- Contact Route -------------------- */

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log('Incoming contact request:', req.body);

    /* -------- Validation -------- */
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    /* -------------------- Admin Email Template -------------------- */
    const adminTemplate = `
    <div style="font-family: Arial, sans-serif; padding:20px;">
      <h2 style="color:#333;">📩 New Contact Form Submission</h2>
      <p>A new message has been submitted through your website contact form.</p>
      <table style="border-collapse: collapse; width:100%; margin-top:15px;">
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><strong>Name</strong></td>
          <td style="padding:10px; border:1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><strong>Email</strong></td>
          <td style="padding:10px; border:1px solid #ddd;">${email}</td>
        </tr>
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><strong>Message</strong></td>
          <td style="padding:10px; border:1px solid #ddd;">${message}</td>
        </tr>
      </table>
      <p style="margin-top:20px; color:#777;">
        This email was automatically generated from your website contact form.
      </p>
    </div>
    `;

    /* -------------------- User Confirmation Template -------------------- */
    const userTemplate = `
    <div style="font-family: Arial, sans-serif; padding:20px;">
      <h2 style="color:#4CAF50;">Thank You for Contacting Me!</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>
        I have successfully received your message. I will review it and
        respond as soon as possible.
      </p>
      <h3>Your Message</h3>
      <div style="background:#f5f5f5; padding:15px; border-radius:5px;">
        ${message}
      </div>
      <p style="margin-top:20px;">
        If your request is urgent, please feel free to reply to this email.
      </p>
      <p style="margin-top:25px;">
        Best Regards,<br/>
        <strong>Abhinav Sunil</strong>
      </p>
    </div>
    `;

    /* -------------------- Send Emails via Resend -------------------- */
    console.log('Sending admin email...');
    await resend.emails.send({
      from: 'onboarding@resend.dev', // ← free Resend sender (no domain needed)
      to: process.env.EMAIL_USER, // ← your Gmail receives it
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: adminTemplate,
    });
    console.log('Admin email sent');

    console.log('Sending user confirmation email...');
    await resend.emails.send({
      from: 'onboarding@resend.dev', // ← free Resend sender
      to: email,
      subject: 'I received your message ✔',
      html: userTemplate,
    });
    console.log('User confirmation email sent');

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Email Error:', error);
    return res.status(500).json({
      error: 'Failed to send message',
    });
  }
});

/* -------------------- Start Server -------------------- */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

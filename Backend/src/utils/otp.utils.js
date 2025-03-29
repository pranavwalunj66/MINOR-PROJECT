const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASSWORD || 'test_password'
  }
});

// Twilio client (optional)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send Email OTP
const sendEmailOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'test@example.com',
      to: email,
      subject: 'Quizcraze - Email Verification OTP',
      html: `
        <h1>Email Verification</h1>
        <p>Your OTP for Quizcraze verification is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Send SMS OTP
const sendSMSOTP = async (phone, otp) => {
  try {
    if (!twilioClient) {
      console.warn('Twilio is not configured. SMS OTP service is disabled.');
      return false;
    }

    await twilioClient.messages.create({
      body: `Your Quizcraze verification OTP is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendEmailOTP,
  sendSMSOTP
};

import nodemailer from 'nodemailer';

export const sendVerificationEmail = (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Email Verification',
    html: `<h2>Please verify your email by clicking the following link</h2><a href="${process.env.BASE_URL}/api/auth/verify?token=${token}">Verify Email</a>`,
  };

  return transporter.sendMail(mailOptions);
};

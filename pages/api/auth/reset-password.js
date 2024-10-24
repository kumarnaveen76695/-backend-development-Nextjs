import db from '../utils/db';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  const { email } = req.body;

  const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (user.length === 0) return res.status(400).json({ message: 'User not found' });

  const resetToken = jwt.sign({ email }, 'jwt_secret_key', { expiresIn: '15m' });
  await db.query('UPDATE users SET reset_token = ? WHERE email = ?', [resetToken, email]);

  // Send reset email
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'your_email@gmail.com', pass: 'your_password' },
  });

  const resetUrl = `http://localhost:3000/api/auth/reset?token=${resetToken}`;
  await transporter.sendMail({
    from: '"Contact Manager" <your_email@gmail.com>',
    to: email,
    subject: 'Password Reset',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  });

  res.status(200).json({ message: 'Reset password email sent' });
}

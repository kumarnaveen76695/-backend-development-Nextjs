import db from '../utils/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, 'jwt_secret_key');
    await db.query('UPDATE users SET is_verified = 1 WHERE email = ?', [decoded.email]);

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
}

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { email, password } = req.body;
  try {
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user.length || !await bcrypt.compare(password, user[0].password)) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    
    const token = jwt.sign({ userId: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

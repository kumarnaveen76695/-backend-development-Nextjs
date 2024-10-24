import bcrypt from 'bcrypt';
import db from '../utils/db';

import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    try {
      // Check if the user already exists
      const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user into the database
      await db.query('INSERT INTO users (name, email, password, is_verified) VALUES (?, ?, ?, ?)', 
        [name, email, hashedPassword, false]);

      res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

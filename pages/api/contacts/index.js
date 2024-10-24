import { authenticate } from '../utils/authMiddleware';
import db from '../utils/db';
import { validateContact } from '@/validators/contactValidator';
//import upload from "./update"

export default async function handler(req, res) {
    const userId = authenticate(req);
    const { id } = req.query;

    console.log('Request method:', req.method);
    console.log('User ID:', userId);
    console.log('Contact ID:', id);

    // Handle POST method (create contact)
    if (req.method === 'POST') {
        const { name, email, phone, address, timezone } = req.body;
        const { error } = validateContact(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        try {
            const [result] = await db.query(
                'INSERT INTO contacts (user_id, name, email, phone, address, timezone) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, name, email, phone, address, timezone]
            );
            return res.status(201).json({ message: 'Contact created successfully!' });
        } catch (error) {
            console.error('Error creating contact:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Handle GET method (fetch contacts)
    if (req.method === 'GET') {
        if (id) {
            // Fetch a specific contact
            try {
                const [contact] = await db.query(
                    'SELECT * FROM contacts WHERE id = ? AND user_id = ? AND is_deleted = FALSE',
                    [id, userId]
                );
                if (contact.length === 0) {
                    return res.status(404).json({ message: 'Contact not found' });
                }
                return res.status(200).json(contact[0]);
            } catch (error) {
                console.error('Error fetching contact:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        } else {
            // Fetch all contacts
            const { name, email, timezone } = req.query;
            const filters = [];
            let query = 'SELECT * FROM contacts WHERE user_id = ? AND is_deleted = FALSE';

            if (name) {
                query += ' AND name LIKE ?';
                filters.push(`%${name}%`);
            }
            if (email) {
                query += ' AND email LIKE ?';
                filters.push(`%${email}%`);
            }
            if (timezone) {
                query += ' AND timezone = ?';
                filters.push(timezone);
            }

            try {
                const [contacts] = await db.query(query, [userId, ...filters]);
                return res.status(200).json(contacts);
            } catch (error) {
                console.error('Error fetching contacts:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    // Handle PUT method (update contact)
    if (req.method === 'PUT') {
        if (!id) {
            return res.status(400).json({ message: 'Contact ID is required for updating' });
        }

        const { name, email, phone, address, timezone } = req.body;

        try {
            const [result] = await db.query(
                'UPDATE contacts SET name = ?, email = ?, phone = ?, address = ?, timezone = ? WHERE id = ? AND user_id = ? AND is_deleted = FALSE',
                [name, email, phone, address, timezone, id, userId]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Contact not found or no changes made' });
            }
            return res.status(200).json({ message: 'Contact updated successfully!' });
        } catch (error) {
            console.error('Error updating contact:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Handle DELETE method (soft delete contact)
    if (req.method === 'DELETE') {
        if (!id) {
            return res.status(400).json({ message: 'Contact ID is required for deletion' });
        }

        try {
            const [result] = await db.query(
                'UPDATE contacts SET is_deleted = TRUE WHERE id = ? AND user_id = ?',
                [id, userId]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Contact not found' });
            }
            return res.status(200).json({ message: 'Contact deleted successfully!' });
        } catch (error) {
            console.error('Error deleting contact:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Handle unsupported methods
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

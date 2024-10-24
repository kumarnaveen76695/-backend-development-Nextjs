import db from '../utils/db';


export default async function handler(req, res) {
  const userId = authenticate(req);

  try {
    const [contacts] = await db.query('SELECT * FROM contacts WHERE user_id = ? AND is_deleted = FALSE', [userId]);
    const csvData = generateCSV(contacts);  // Generate CSV from contacts

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    res.status(200).send(csvData);
  } catch (error) {
    console.error('Error downloading contacts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

import db from '../utils/db';
 // Make sure to adjust the path based on your structure

export default async function handler(req, res) {
    const userId = authenticate(req); // Assuming you have an authentication function

    try {
        // Fetch contacts for the authenticated user
        const [contacts] = await db.query('SELECT * FROM contacts WHERE user_id = ? AND is_deleted = FALSE', [userId]);
        
        // Generate CSV from contacts
        const csvData = generateCSV(contacts);

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
        res.status(200).send(csvData);
    } catch (error) {
        console.error('Error downloading contacts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Function to generate CSV from contacts
const generateCSV = (data) => {
    // Check if data is not empty
    if (!data || data.length === 0) {
        return ''; // Return empty string if no data
    }

    // Get the keys from the first object as the CSV header
    const headers = Object.keys(data[0]);

    // Create the CSV rows
    const rows = data.map((row) => 
        headers.map((header) => JSON.stringify(row[header], replacer)).join(',')
    );

    // Combine headers and rows
    return [headers.join(','), ...rows].join('\n');
};

// Optional: Use this replacer to handle special characters
const replacer = (key, value) => {
    if (value === null) {
        return '';
    }
    return value;
};

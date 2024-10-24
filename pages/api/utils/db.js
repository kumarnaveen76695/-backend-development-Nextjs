// db.js
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    password: '12345', 
    database: 'contact_manager', 
});

module.exports = db;

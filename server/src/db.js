const path = require('path');
const mysql = require('mysql2');


require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })

//MYSQL CONFIGS
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

module.exports = db;
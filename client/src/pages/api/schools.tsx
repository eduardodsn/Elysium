import { NextApiRequest, NextApiResponse } from 'next'
const mysql = require('mysql');
require('dotenv').config()

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: ''
});

export default async function schools(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== 'POST') {
        res.status(500).json({message: 'Unable to finish request'})
    } else {
        
        db.connect((err) => {
            if (err) throw err;
            db.query('USE Elysium', function (error, results, fields) {
                if (err) throw err;
            });

            db.query('SELECT id_escola, nm_escola FROM escolas WHERE uf = ?', req.body.estado, function (error, results, fields) {
                if (err) throw err;
                return res.json({ data: results })
            });

        });
    }
}
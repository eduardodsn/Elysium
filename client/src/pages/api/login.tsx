import { NextApiRequest, NextApiResponse } from 'next'
import sha1 from 'sha1';
const mysql = require('mysql');
require('dotenv').config()

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: ''
});


export default async function login(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== 'POST') {
        res.status(500).json({message: 'Unable to finish request'})
    } else {
        const emailTyped = req.body.email;
        const passwordTyped = sha1(req.body.password);

        await connection.connect((err) => {
            if (err) throw err;
            
        });

        // const usuario = await db.get('SELECT id, email, senha FROM usuarios WHERE email = ?', emailTyped);
        
        // if(usuario != undefined) {
        //     if(usuario.senha == passwordTyped) {  
        //         res.json({auth: true, userEmail: usuario.email, userId: usuario.id});
        //     } else {
        //         res.json({auth: false, error: 'passwordIncorrect'});
        //     }
        // }else {
        //     res.json({auth: false, error: 'emailNotExists'});
        // }
    }
}
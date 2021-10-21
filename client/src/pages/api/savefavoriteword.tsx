import { NextApiRequest, NextApiResponse } from 'next'
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path')

export default async function saveFavoriteWord(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== 'POST') {
        res.status(500).json({message: 'Unable to finish request'})
    } else {
        const db = await sqlite.open({
            filename: path.resolve('mydb.sqlite'),
            driver: sqlite3.Database
        });
        
        const statement = await db.prepare(
            'INSERT INTO favoritos (palavra_favorita, id_usuario) VALUES (?, ?)'
        );

        const result = await statement.run(
            req.body.word,
            req.body.user_id
        )
        res.json({ log: 'success' })
    }
}
import { NextApiRequest, NextApiResponse } from 'next'
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path')

export default async function removeFavoriteWord(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== 'POST') {
        res.status(500).json({message: 'Unable to finish request'})
    } else {

        const db = await sqlite.open({
            filename: path.resolve('mydb.sqlite'),
            driver: sqlite3.Database
        });

        const result = await db.all('DELETE FROM favoritos WHERE id_usuario = ? AND palavra_favorita = ?', req.body.user_id, req.body.word);
        res.json({ log: 'success' })
    }
}
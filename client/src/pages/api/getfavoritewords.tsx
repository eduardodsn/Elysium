import { NextApiRequest, NextApiResponse } from 'next'
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path')

export default async function getFavoriteWords(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== 'POST') {
        res.status(500).json({message: 'Unable to finish request'})
    } else {

        const db = await sqlite.open({
            filename: path.resolve('mydb.sqlite'),
            driver: sqlite3.Database
        });
        
        const palavras = await db.all("SELECT palavra_favorita FROM favoritos WHERE id_usuario = ?", req.body.user_id)
        res.json(palavras)
    }
}
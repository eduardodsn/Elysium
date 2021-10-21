import { NextApiRequest, NextApiResponse } from 'next'
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');


export default async function addHistory(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== 'POST') {
        res.status(500).json({message: 'Unable to finish request'})
    } else {

        const db = await sqlite.open({
            filename: './mydb.sqlite',
            driver: sqlite3.Database
        });
        const lastId = await db.all("SELECT * FROM historico WHERE id_historico = (SELECT MAX(id_historico) FROM ('historico'))");

        const updateXp = await db.all('UPDATE usuarios SET xp = xp + ? WHERE id = ?', req.body.xp, req.body.user_id);
        if(req.body.id_questao != "") {
            const updateHistory = await db.all('INSERT INTO historico VALUES(?, ?, ?)', lastId[0] ? lastId[0].id_historico + 1 : 1, req.body.id_questao, req.body.user_id);
        }
        res.json("ok")
    }
}
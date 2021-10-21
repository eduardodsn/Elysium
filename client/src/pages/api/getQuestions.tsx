import { NextApiRequest, NextApiResponse } from 'next'
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path')

export default async function getQuestions(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== 'POST') {
        res.status(500).json({message: 'Unable to finish request'})
    } else {

        const db = await sqlite.open({
            filename: path.resolve('mydb.sqlite'),
            driver: sqlite3.Database
        });
        
        const questoes = await db.all(`
        SELECT  questoes.id_questao, questoes.ds_questao, opcoes.ds_opcoes, opcoes.id_questao AS ID, opcoes.certo
        FROM    questoes INNER JOIN
                opcoes ON questoes.id_questao = opcoes.id_questao
        WHERE   (questoes.id_questao NOT IN
                (SELECT     id_questao
                 FROM       historico
                 WHERE      (id_usuario = ?)))`, req.body.user_id)
        res.json(questoes)
    }
}
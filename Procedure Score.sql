create
    definer = rootelysium@`%` procedure sp_atualiza_score_escolas()
UPDATE escolas, ranking_escolas
set escolas.score = ranking_escolas.xp
where escolas.nm_escola = ranking_escolas.nm_escola;


create definer = rootelysium@`%` event atualiza_score_escolas on schedule
    every '1' DAY
        starts '2021-10-22 22:42:38'
    enable
    do
    CALL sp_atualiza_score_escolas();
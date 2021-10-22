create definer = rootelysium@`%` view ranking_escolas as
select sum(`u`.`xp`) AS `xp`, `e`.`nm_escola` AS `nm_escola`, `e`.`cidade` AS `cidade`, `e`.`uf` AS `uf`
from (`Elysium`.`usuarios` `u`
        join `Elysium`.`escolas` `e` on ((`u`.`id_escola` = `e`.`id_escola`)))
group by `u`.`id_escola`
order by `xp` desc
limit 5;

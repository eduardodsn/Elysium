create
   definer = rootelysium@`%` procedure sp_atualizar_emblema_usuario()
update usuarios u set u.id_emblema = (
   select
       case
           when u.xp >= 10000 then 5
           when u.xp >= 5000 then 4
           when u.xp >= 1500 then 3
           when u.xp >= 500 then 2
           else 1
       end
) where u.xp > 0;

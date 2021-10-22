create definer = rootelysium@`%` event atualiza_emblema on schedule
   every '5' MINUTE
       starts '2021-10-22 22:42:38'
   enable
   do
   CALL sp_atualizar_emblema_usuario();

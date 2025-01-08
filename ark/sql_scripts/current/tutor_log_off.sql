DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE tutor_log_off(t_id_as_hex VARBINARY(36))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DECLARE t_id VARBINARY(16);
            SET t_id = (SELECT UUID_TO_BIN(t_id_as_hex, 0));

            UPDATE tutor_accounts SET is_online=0, last_online=NOW() where account_id=t_id;
        END;
END //
DELIMITER ;

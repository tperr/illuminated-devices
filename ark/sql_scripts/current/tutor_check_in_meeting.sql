DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE patron_check_in_meeting(t_id_as_hex VARBINARY(36))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DECLARE t_id VARBINARY(16);
            SET t_id = (SELECT UUID_TO_BIN(t_id_as_hex, 0));

            SELECT meeting_id FROM meeting_queue WHERE tutor_id = t_id;
        END;
END //
DELIMITER ;

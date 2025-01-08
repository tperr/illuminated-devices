DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE st_assign_patron_to_tutor(m_id MEDIUMINT(9), t_id_as_hex VARBINARY(36))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DECLARE t_id VARBINARY(16);
            SET t_id = (SELECT UUID_TO_BIN(t_id_as_hex, 0));
            UPDATE meeting_queue SET tutor_id = t_id, patron_dropped=0, tutor_dropped=0, in_meeting=0 where meeting_id = m_id;
            SELECT "SUCCESS";
        END;
END //
DELIMITER ;

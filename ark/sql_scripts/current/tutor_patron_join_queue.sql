DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE tutor_patron_join_queue(m_id MEDIUMINT(9))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            UPDATE meeting_queue SET in_meeting = in_meeting + 1 WHERE meeting_id = m_id;
        END;
END //
DELIMITER ;

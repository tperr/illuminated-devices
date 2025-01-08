DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE patron_get_meeting(m_id MEDIUMINT(9))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            SELECT in_meeting FROM meeting_queue WHERE meeting_id = m_id;
        END;
END //
DELIMITER ;

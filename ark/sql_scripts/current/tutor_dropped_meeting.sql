DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE tutor_dropped_meeting(m_id MEDIUMINT(9))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            UPDATE meeting_queue SET tutor_dropped = 1, in_meeting = 0 WHERE meeting_id=m_id;
            SELECT "SUCCESS";
        END;
END //
DELIMITER ;

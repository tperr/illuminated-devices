DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE patron_check_if_assigned(m_id MEDIUMINT(9))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        UPDATE meeting_queue SET rejoined = 0 WHERE meeting_id=m_id;
        BEGIN
            SELECT BIN_TO_UUID(tutor_id, 0) tutor_id
            FROM meeting_queue
            WHERE meeting_id=m_id
            ;
        END;
END //
DELIMITER ;

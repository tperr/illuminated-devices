DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE end_meeting(m_id MEDIUMINT(9))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DELETE FROM meeting_queue WHERE meeting_id = m_id;
            
            select "SUCCESS";
        END;
END //
DELIMITER ;

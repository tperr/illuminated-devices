DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE get_meeting_info(m_id MEDIUMINT(9))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            SELECT 
                meeting_id,
                BIN_TO_UUID(pr.patron_id, 0) patron_id,
                BIN_TO_UUID(mq.tutor_id, 0) tutor_id,
                fname,
                lname,
                name device_name,
                topic,
                session_key,
                pwd
                FROM 
                (meeting_queue mq 
                LEFT JOIN patron_roster pr 
                ON mq.patron_id=pr.patron_id) 
                LEFT JOIN devices d 
                ON d.patron_id=mq.patron_id
                WHERE meeting_id = m_id;
        END;
END //
DELIMITER ;

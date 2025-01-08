DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE get_meeting_queue(t_id_as_hex VARBINARY(36))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DECLARE t_id VARBINARY(16);
            DECLARE is_super int(1);
            SET t_id = (SELECT UUID_TO_BIN(t_id_as_hex, 0));
            set is_super = (SELECT is_supertutor FROM tutor_accounts WHERE account_id=t_id);
		    -- set is_super = 1;
            
        SELECT 
            meeting_id,
            BIN_TO_UUID(pr.patron_id, 0) patron_id,
            BIN_TO_UUID(mq.tutor_id, 0) tutor_id,
            fname,
            lname,
            name device_name,
            topic,
            session_key,
            pwd,
            pr.notes,
            in_meeting
        FROM meeting_queue mq 
	    LEFT JOIN patron_roster pr
	    ON pr.patron_id=mq.patron_id
        LEFT JOIN devices d 
        ON d.patron_id=pr.patron_id
        WHERE 
            (tutor_id = t_id
            OR
            is_super = 1)
        ORDER BY in_meeting, meeting_id;
        END;
END //
DELIMITER ;

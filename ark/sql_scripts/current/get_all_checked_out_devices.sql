DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE get_checked_out_devices()
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            SELECT 
                BIN_TO_UUID(device_id, 0) device_id,
                name,
                BIN_TO_UUID(d.patron_id, 0) patron_id,
                d.notes notes,
                fname,
                lname,
                is_online
            FROM devices d 
            LEFT JOIN meeting_queue mq 
            ON d.patron_id=mq.patron_id 
            LEFT JOIN patron_roster pr 
            ON d.patron_id=pr.patron_id
            WHERE status="Checked Out"
            AND meeting_id IS NULL
            ORDER BY is_online DESC
            ;
        END;
END //
DELIMITER ;

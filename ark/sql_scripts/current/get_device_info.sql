DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE get_device_info(d_id_as_hex VARBINARY(36))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            SELECT 
                BIN_TO_UUID(device_id, 0) as device_id,
                BIN_TO_UUID(patron_id, 0) as patron_id,
                name,
                status,
                is_ipad
            FROM devices 
            WHERE device_id=UUID_TO_BIN(d_id_as_hex, 0);
        END;
END //
DELIMITER ;

DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE device_log_onoff(d_id_as_hex VARBINARY(36), in_out TINYINT(1))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DECLARE d_id VARBINARY(16);
            SET d_id = (SELECT UUID_TO_BIN(d_id_as_hex, 0));

            UPDATE devices SET is_online=in_out where device_id=d_id;
            SELECT "SUCCESS";
        END;
END //
DELIMITER ;

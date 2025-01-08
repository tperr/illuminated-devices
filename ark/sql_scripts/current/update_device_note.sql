DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE update_device_note(d_id_hex VARCHAR(36), note VARCHAR(128))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DECLARE d_id VARBINARY(16);
            SET d_id = (SELECT UUID_TO_BIN(d_id_hex, 0));


            UPDATE devices 
            SET notes = note
            WHERE device_id = d_id;

            SELECT "SUCCESS";
        END;
END //
DELIMITER ;

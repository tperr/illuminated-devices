DELIMITER //
USE ark //
CREATE OR REPLACE FUNCTION subroutine_checkin_device_from_patron(account_id_as_hex VARCHAR(36), device_id_as_hex VARCHAR(36), patron_id_as_hex VARCHAR(36), notes VARCHAR(128)) RETURNS INT
    BEGIN
        DECLARE organization_id_as_bin, account_id_as_bin, device_id_as_bin, patron_id_as_bin VARBINARY(16);
        DECLARE return_time TIMESTAMP; 

        -- Get UUID for organization as binary
        SET account_id_as_bin = (SELECT UUID_TO_BIN(account_id_as_hex, 0));
        SET organization_id_as_bin = (SELECT organization_id FROM organization_accounts WHERE account_id=account_id_as_bin);

        -- Get UUID for device as binary
        SET device_id_as_bin = UUID_TO_BIN(device_id_as_hex, 0);
        -- Get UUID for patron as binary
        SET patron_id_as_bin = UUID_TO_BIN(patron_id_as_hex, 0);

        -- Convert Unix timestamp (int) to Timestamp the database expects
        SET return_time = NOW();

        -- Update table
        UPDATE devices
        SET 
        patron_id = NULL,
        last_checkin = return_time, 
        current_location_id = account_id_as_bin,
        status = 1,
        is_online = 0
        WHERE 
        device_id = device_id_as_bin
        AND
        organization_id = organization_id_as_bin
        ;

        -- Insert into logs
        INSERT INTO logs
        (
            patron_id,
            device_id,
            action,
            action_location,
            notes
        )
        VALUES
        (
            patron_id_as_bin,
            device_id_as_bin,
            "Checked in",
            account_id_as_bin,
            notes
        )
        ;

        RETURN (SELECT COUNT(*) FROM devices WHERE device_id=device_id_as_bin AND status=1);
    END //

CREATE OR REPLACE PROCEDURE checkin_device_from_patron(account_id_as_hex VARCHAR(36), device_id_as_hex VARCHAR(36), patron_id_as_hex VARCHAR(36))
    BEGIN NOT ATOMIC
    	DECLARE count INT;
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
        ROLLBACK;
    END;

    BEGIN
        SET count = (SELECT COUNT(*) FROM devices WHERE device_id=UUID_TO_BIN(device_id_as_hex, 0) AND patron_id=UUID_TO_BIN(patron_id_as_hex, 0));
        IF (count > 0) THEN
            SELECT subroutine_checkin_device_from_patron(account_id_as_hex, device_id_as_hex, patron_id_as_hex, "DEFAULT CHECK IN") AS checked_in;
        ELSE
            SELECT 0 AS checked_in; -- Device was not checked out to this patron 
        END IF;
    END; 
END //
DELIMITER ;
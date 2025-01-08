DELIMITER //
USE ark //
CREATE OR REPLACE FUNCTION subroutine_checkout_device_to_patron(account_id_as_hex VARCHAR(36), device_id_as_hex VARCHAR(36), patron_id_as_hex VARCHAR(36), last_checkout_unix INT, return_date_unix INT, notes VARCHAR(128)) RETURNS INT
    BEGIN
        DECLARE account_id_as_bin, device_id_as_bin, patron_id_as_bin VARBINARY(16);
        DECLARE last_checkout_timestamp, return_date_timestamp TIMESTAMP; 

        -- Get UUID for location as binary
        SET account_id_as_bin = (SELECT UUID_TO_BIN(account_id_as_hex, 0));

        -- This would be for org but we don't need it for this
        -- SET organization_id_as_bin = (SELECT organization_id FROM organization_accounts WHERE account_id=account_id_as_bin);

        -- Get UUID for device as binary
        SET device_id_as_bin = UUID_TO_BIN(device_id_as_hex, 0);
        -- Get UUID for patron as binary
        SET patron_id_as_bin = UUID_TO_BIN(patron_id_as_hex, 0);

        -- Convert Unix timestamp (int) to Timestamp the database expects
        SET last_checkout_timestamp = FROM_UNIXTIME(last_checkout_unix);
        SET return_date_timestamp = FROM_UNIXTIME(return_date_unix);

        -- Update table
        UPDATE devices
        SET 
        patron_id = patron_id_as_bin,
        last_checkout = last_checkout_timestamp, 
        return_date = return_date_timestamp,
        current_location_id = account_id_as_bin,
        status = 2
        WHERE 
        device_id = device_id_as_bin
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
            "Checked out",
            account_id_as_bin,
            notes
        )
        ;

        RETURN (SELECT COUNT(*) FROM devices WHERE device_id=device_id_as_bin AND status=2);
    END //

CREATE OR REPLACE PROCEDURE checkout_device_to_patron(account_id_as_hex VARCHAR(36), device_id_as_hex VARCHAR(36), patron_id_as_hex VARCHAR(36), last_checkout_unix INT, return_date_unix INT)
    BEGIN NOT ATOMIC
    	DECLARE count INT;
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
        ROLLBACK;
    END;

    BEGIN
        SET count = (SELECT COUNT(*) FROM devices WHERE device_id=UUID_TO_BIN(device_id_as_hex, 0) AND status=1);
        IF (count > 0) THEN
            SELECT subroutine_checkout_device_to_patron(account_id_as_hex, device_id_as_hex, patron_id_as_hex, last_checkout_unix, return_date_unix, "DEFAULT CHECK OUT") AS checked_out;
        ELSE
            SELECT 0 AS checked_out;
        END IF;
    END; 
END //
DELIMITER ;
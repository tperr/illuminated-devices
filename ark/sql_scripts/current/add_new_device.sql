DELIMITER //
USE ark //
CREATE OR REPLACE FUNCTION subroutine_add_new_device(account_id_as_hex VARCHAR(36), device_name VARCHAR(32), notes VARCHAR(128), ipad TINYINT(1)) RETURNS VARCHAR(36)
    BEGIN
        DECLARE uuid_as_bin, organization_id_as_bin, account_id_as_bin VARBINARY(16);
        DECLARE d_name VARCHAR(32);
        SET d_name = (SELECT name FROM devices where name = device_name);
        IF d_name IS NOT NULL
        THEN
            RETURN -1;
        END IF;
        
        SET account_id_as_bin = UUID_TO_BIN(account_id_as_hex, 0);
        -- get org device account is associated with
        SET organization_id_as_bin = (SELECT organization_id FROM organization_accounts WHERE account_id=account_id_as_bin);

	    SET uuid_as_bin = UUID_TO_BIN(UUID(), 0);

        -- Insert device into table
        INSERT INTO devices 
        (
            identifierForVendor, 
            organization_id, 
            patron_id, 
            device_id, 
            name, 
            date_added,
            last_checkout,
            return_date,
            last_checkin,
            status,
            bsid,
            current_location_id,
            home_location_id,
            notes,
            is_online,
            is_ipad
        )
        VALUES
        (
            NULL, 
            organization_id_as_bin, 
            NULL, 
            uuid_as_bin, 
            device_name,
            NOW(),
            NOW(),
            NOW(),
            NOW(),
            "Available",
            BIN_TO_UUID(uuid_as_bin,0),
            organization_id_as_bin,
            organization_id_as_bin,
            "",
            0,
            ipad
        )
        ;

        -- Insert log into table
        INSERT INTO logs
        (
            device_id,
            action,
            action_location,
            notes
        )
        VALUES
        (
            uuid_as_bin,
            "Added New",
            organization_id_as_bin,
            notes
        )
        ;

        RETURN (BIN_TO_UUID(uuid_as_bin, 0));
    END //

CREATE OR REPLACE PROCEDURE add_new_device(provider_id_as_hex VARCHAR(36), device_name VARCHAR(32), notes VARCHAR(128), ipad TINYINT(1))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
        ROLLBACK;
    END;

    BEGIN
        SELECT subroutine_add_new_device(provider_id_as_hex, device_name, notes, ipad);
    END; 
END //
DELIMITER ;
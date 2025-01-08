DELIMITER //
USE ark //
CREATE OR REPLACE FUNCTION subroutine_update_device_information(account_id_as_bin VARBINARY(16), organization_id_as_bin VARBINARY(16), device_id_as_bin VARBINARY(16), new_device_name VARCHAR(32), new_bsid VARCHAR(64), new_home_location_id_as_bin VARBINARY(16), new_current_location_id_as_bin VARBINARY(16), new_notes VARCHAR(128), command_number INT, notes VARCHAR(128)) RETURNS INT
    BEGIN
        DECLARE count INT; 

        -- 1000, 1001, 1010, 1011, 1100, 1101, 1110, 1111 (8-15)
        IF ((command_number - 16) >= 0) THEN
            -- Ensure that this name is not already being used by another device belonging to this organization
            SET count = (SELECT COUNT(*) FROM devices WHERE organization_id=organization_id_as_bin AND name=new_device_name);
            IF count > 0 THEN
                RETURN -1; -- Name already in use
            END IF;
            SET command_number = command_number - 16;
        END IF;

        IF ((command_number - 8) >= 0) THEN
            -- Ensure that the BSID is not already being used by another device belonging to this organization
            SET count = (SELECT COUNT(*) FROM devices WHERE organization_id=organization_id_as_bin AND bsid=new_bsid);
            IF count > 0 THEN
                RETURN -2; -- BSID already in use
            END IF; 
            SET command_number = command_number - 8;
        END IF;

        IF ((command_number - 4) >= 0) THEN
            -- Ensure that the locations belong to the organization
            SET count = (SELECT COUNT(*) FROM organization_accounts WHERE organization_id=organization_id_as_bin AND account_id=new_home_location_id_as_bin);
            IF count < 1 THEN
                RETURN -3; -- Invalid home location
            END IF;
            SET command_number = command_number - 4;
        END IF;

        IF ((command_number - 2) >= 0) THEN
            SET count = (SELECT COUNT(*) FROM organization_accounts WHERE organization_id=organization_id_as_bin AND account_id=new_current_location_id_as_bin);
            IF count < 1 THEN 
                RETURN -4; -- Invalid current location
            END IF;
            SET command_number = command_number - 2;
        END IF;

        IF ((command_number - 1) >= 0) THEN
            -- Notes don't have to be unique, nothing to do here
            SET command_number = command_number - 1;
        END IF;


        -- Update devices
        UPDATE devices
        SET
            name=new_device_name,
            bsid=new_bsid,
            home_location_id=new_home_location_id_as_bin,
            current_location_id=new_current_location_id_as_bin,
            notes=new_notes
        WHERE 
            organization_id=organization_id_as_bin
            AND
            device_id=device_id_as_bin
        ;
        
        -- Insert into logs
        INSERT INTO logs
        (
            device_id,
            action,
            action_location,
            notes
        )
        VALUES
        (
            device_id_as_bin,
            "Edited Details",
            account_id_as_bin,
            notes
        )
        ;

        -- RETURN 1;
        RETURN (SELECT COUNT(*) FROM devices WHERE organization_id=organization_id_as_bin AND device_id=device_id_as_bin AND name=new_device_name AND bsid=new_bsid AND home_location_id=new_home_location_id_as_bin AND current_location_id=new_current_location_id_as_bin);
    END //

CREATE OR REPLACE PROCEDURE update_device_information(account_id_as_hex VARCHAR(36), device_id_as_hex VARCHAR(36), new_device_name VARCHAR(32), new_bsid VARCHAR(64), new_home_location_id_as_hex VARCHAR(36), new_current_location_id_as_hex VARCHAR(36), new_notes VARCHAR(128), command_number INT)
    BEGIN NOT ATOMIC
        DECLARE account_id_as_bin, organization_id_as_bin, device_id_as_bin, new_home_location_id_as_bin, new_current_location_id_as_bin VARBINARY(16);
        DECLARE count INT;
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
        ROLLBACK;
    END;

    BEGIN
        -- Convert Hex (ease of use) to VARBINARY (storage format)
        SET account_id_as_bin = (SELECT UUID_TO_BIN(account_id_as_hex, 0));
        SET organization_id_as_bin = (SELECT organization_id FROM organization_accounts WHERE account_id=account_id_as_bin);
        SET device_id_as_bin = UUID_TO_BIN(device_id_as_hex, 0);
        SET new_home_location_id_as_bin = UUID_TO_BIN(new_home_location_id_as_hex, 0);
        SET new_current_location_id_as_bin = UUID_TO_BIN(new_current_location_id_as_hex, 0);

        -- If the device exists and belongs to this organization then count > 0
        SET count = (SELECT COUNT(*) FROM devices WHERE organization_id=organization_id_as_bin AND device_id=device_id_as_bin);
        IF (count > 0) THEN
            SELECT subroutine_update_device_information(account_id_as_bin, organization_id_as_bin, device_id_as_bin, new_device_name, new_bsid, new_home_location_id_as_bin, new_current_location_id_as_bin, new_notes, command_number, "DEFAULT DEVICE UPDATE") as device_updated;
        ELSE 
            SELECT 0 AS device_updated; -- Device either does not exist or does not belong to this organization
        END IF;
    END; 
END //
DELIMITER ;
DELIMITER //
USE ark //
CREATE OR REPLACE FUNCTION subroutine_update_patron_information(account_id_as_bin VARBINARY(16), organization_id_as_bin VARBINARY(16), patron_id_as_bin VARBINARY(16), new_fname VARCHAR(64), new_lname VARCHAR(64), new_bsid VARCHAR(64), new_birthday_as_int INT, new_email VARCHAR(255), new_phone VARCHAR(12), new_street_address VARCHAR(64), new_city VARCHAR(32), new_state VARCHAR(2), new_zip VARCHAR(10), new_notes VARCHAR(128), command_number INT, notes VARCHAR(128)) RETURNS INT
    BEGIN
        DECLARE count INT; 

        IF ((command_number - 64) >= 0) THEN
            -- Names don't have to be unique, nothing to do here
            SET command_number = command_number - 64;
        END IF;

        IF ((command_number - 32) >= 0) THEN
            -- Ensure that the BSID is not already being used by another patron assigned to this organization
            SET count = (SELECT COUNT(*) FROM patron_roster WHERE organization_id=organization_id_as_bin AND bsid=new_bsid);
            IF count > 0 THEN
                RETURN -2; -- BSID already in use
            END IF; 
            SET command_number = command_number - 32;
        END IF;

        IF ((command_number - 16) >= 0) THEN
            -- Birthdays don't have to be unique, nothing to do here
            SET command_number = command_number - 16;
        END IF;

        IF ((command_number - 8) >= 0) THEN
            -- Ensure that the email is not already being used by another patron assigned to this organization
            SET count = (SELECT COUNT(*) FROM patron_roster WHERE organization_id=organization_id_as_bin AND email=new_email);
            IF count > 0 THEN 
                RETURN -4; -- Invalid email
            END IF;
            SET command_number = command_number - 8;
        END IF;

        IF ((command_number - 4) >= 0) THEN
            -- Ensure that the phone is not already being used by another patron assigned to this organization
            SET count = (SELECT COUNT(*) FROM patron_roster WHERE organization_id=organization_id_as_bin AND phone=new_phone);
            IF count > 0 THEN 
                RETURN -5; -- Invalid phone
            END IF;
            SET command_number = command_number - 4;
        END IF;

        IF ((command_number - 2) >= 0) THEN
            -- Addresses don't have to be unique, nothing to do here
            SET command_number = command_number - 2;
        END IF;

        IF ((command_number - 1) >= 0) THEN
            -- Notes don't have to be unique, nothing to do here
            SET command_number = command_number - 1;
        END IF;

        -- Update patron roster
        UPDATE patron_roster
        SET
            fname=new_fname,
            lname=new_lname,
            bsid=new_bsid,
            birthday=FROM_UNIXTIME(new_birthday_as_int),
            email=new_email,
            phone=new_phone,
            street_address=new_street_address,
            city=new_city,
            state=new_state,
            zip=new_zip, 
            notes=new_notes
        WHERE 
            organization_id=organization_id_as_bin
            AND
            patron_id=patron_id_as_bin
        ;

        -- Insert into logs
        INSERT INTO logs
        (
            patron_id,
            action,
            action_location,
            notes
        )
        VALUES
        (
            patron_id_as_bin,
            "Edited Details",
            account_id_as_bin,
            notes
        )
        ;

        RETURN 1;
        -- RETURN (SELECT COUNT(*) FROM devices WHERE organization_id=organization_id_as_bin AND device_id=device_id_as_bin AND name=new_device_name AND bsid=new_bsid AND home_location_id=new_home_location_id_as_bin AND current_location_id=new_current_location_id_as_bin);
    END //

CREATE OR REPLACE PROCEDURE update_patron_information(account_id_as_hex VARCHAR(36), patron_id_as_hex VARCHAR(36), new_fname VARCHAR(64), new_lname VARCHAR(64), new_bsid VARCHAR(64), new_birthday_as_int INT, new_email VARCHAR(255), new_phone VARCHAR(12), new_street_address VARCHAR(64), new_city VARCHAR(32), new_state VARCHAR(2), new_zip VARCHAR(10), new_notes VARCHAR(128), command_number INT)
    BEGIN NOT ATOMIC
        DECLARE account_id_as_bin, organization_id_as_bin, patron_id_as_bin VARBINARY(16);
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
        SET patron_id_as_bin = UUID_TO_BIN(patron_id_as_hex, 0);

        -- If the patron exists and belongs to this organization then count > 0
        SET count = (SELECT COUNT(*) FROM patron_roster WHERE organization_id=organization_id_as_bin AND patron_id=patron_id_as_bin);
        IF (count > 0) THEN
            SELECT subroutine_update_patron_information(account_id_as_bin, organization_id_as_bin, patron_id_as_bin, new_fname, new_lname, new_bsid, new_birthday_as_int, new_email, new_phone, new_street_address, new_city, new_state, new_zip, new_notes, command_number, "DEFAULT PATRON UPDATE") as patron_updated;
        ELSE 
            SELECT 0 AS patron_updated; -- Patron either does not exist or does not belong to this organization
        END IF;
    END; 
END //
DELIMITER ;
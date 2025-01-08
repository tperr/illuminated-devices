DELIMITER //
USE ark //
CREATE OR REPLACE FUNCTION subroutine_add_new_patron(account_id_as_bin VARBINARY(16), organization_id_as_bin VARBINARY(16), patron_id_as_bin VARBINARY(16), new_fname VARCHAR(64), new_lname VARCHAR(64), new_bsid VARCHAR(64), new_birthday_as_int INT, new_email VARCHAR(255), new_phone VARCHAR(12), new_street_address VARCHAR(64), new_city VARCHAR(32), new_state VARCHAR(2), new_zip VARCHAR(10), new_notes VARCHAR(128)) RETURNS INT
    BEGIN
        DECLARE count INT; 

        -- Ensure that the BSID is not already being used by another patron assigned to this organization
        SET count = (SELECT COUNT(*) FROM patron_roster WHERE organization_id=organization_id_as_bin AND bsid=new_bsid);
        IF count > 0 THEN
            RETURN -2; -- BSID already in use
        END IF; 

        -- Ensure that the email is not already being used by another patron assigned to this organization
        SET count = (SELECT COUNT(*) FROM patron_roster WHERE organization_id=organization_id_as_bin AND email=new_email);
        IF count > 0 THEN 
            RETURN -4; -- Invalid email
        END IF;

        -- Ensure that the phone is not already being used by another patron assigned to this organization
        SET count = (SELECT COUNT(*) FROM patron_roster WHERE organization_id=organization_id_as_bin AND phone=new_phone);
        IF count > 0 THEN 
            RETURN -5; -- Invalid phone
        END IF;


        -- Insert into roster
        INSERT INTO patron_roster
        (
            fname, 
            lname,
            bsid, 
            birthday,
            email, 
            phone, 
            street_address, 
            city, 
            state, 
            zip,
            notes,
            organization_id,
            patron_id
        )
        VALUES
        (
            new_fname,
            new_lname,
            new_bsid,
            FROM_UNIXTIME(new_birthday_as_int),
            new_email,
            new_phone,
            new_street_address,
            new_city,
            new_state,
            new_zip,
            new_notes,
            organization_id_as_bin,
            patron_id_as_bin
        )
        ;

        -- Insert into logs
        INSERT INTO logs
        (
            patron_id,
            action,
            action_location
        )
        VALUES
        (
            patron_id_as_bin,
            "Added New",
            account_id_as_bin
        )
        ;

        RETURN (
            SELECT COUNT(*) 
            FROM patron_roster 
            WHERE 
            organization_id=organization_id_as_bin 
            AND patron_id=patron_id_as_bin
            );
    END //

CREATE OR REPLACE PROCEDURE add_new_patron(account_id_as_hex VARCHAR(36), new_fname VARCHAR(64), new_lname VARCHAR(64), new_bsid VARCHAR(64), new_birthday_as_int INT, new_email VARCHAR(255), new_phone VARCHAR(12), new_street_address VARCHAR(64), new_city VARCHAR(32), new_state VARCHAR(2), new_zip VARCHAR(10), new_notes VARCHAR(128))
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
        SET patron_id_as_bin = UUID_TO_BIN(UUID(), 0); -- New UUID

        -- Attempt to add patron
        SELECT subroutine_add_new_patron(account_id_as_bin, organization_id_as_bin, patron_id_as_bin, new_fname, new_lname, new_bsid, new_birthday_as_int, new_email, new_phone, new_street_address, new_city, new_state, new_zip, new_notes) as patron_added;
    END; 
END //
DELIMITER ;
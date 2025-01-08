DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE get_patrons(account_id_as_hex VARCHAR(36))
BEGIN NOT ATOMIC
	DECLARE account_id_as_bin, organization_id_as_bin VARBINARY(16);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
    START TRANSACTION;
        -- Convert Hex (ease of use) to VARBINARY (storage format)
        SET account_id_as_bin = (SELECT UUID_TO_BIN(account_id_as_hex, 0));
        SET organization_id_as_bin = (SELECT organization_id FROM organization_accounts WHERE account_id=account_id_as_bin);

        SELECT 
            BIN_TO_UUID(patron_id, 0) as patron_id, 
            fname,
            lname,
            FLOOR(UNIX_TIMESTAMP(birthday)) as birthday, 
            phone,
            email,
            street_address,
            city,
            state,
            FLOOR(UNIX_TIMESTAMP(registration_date)) as registration_date,
            bsid,
            notes,
            zip
        FROM patron_roster -- Only one service area
        WHERE organization_id=organization_id_as_bin;
        -- could be WHERE service_area=...
    COMMIT;
END //
DELIMITER ;
DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE get_devices(account_id_as_hex VARBINARY(36))
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

        SELECT * FROM 
            (
            SELECT
                BIN_TO_UUID(organization_id, 0) as organization_id, 
                BIN_TO_UUID(patron_id, 0) as patron_id,
                BIN_TO_UUID(device_id, 0) as device_id, 
                name,
                FLOOR(UNIX_TIMESTAMP(date_added)) as date_added, 
                FLOOR(UNIX_TIMESTAMP(last_checkout)) as last_checkout, 
                FLOOR(UNIX_TIMESTAMP(return_date)) as return_date, 
                FLOOR(UNIX_TIMESTAMP(last_checkin)) as last_checkin, 
                status,
                bsid,
                BIN_TO_UUID(current_location_id, 0) as current_location_id,
                BIN_TO_UUID(home_location_id, 0) as home_location_id,
                notes
            FROM devices 
            WHERE (organization_id=organization_id_as_bin OR organization_id_as_bin is NULL)
            ) 
            AS A 
            LEFT JOIN 
            (
                SELECT
                    BIN_TO_UUID(patron_id, 0) as patron_id,
                    fname,
                    lname
                FROM patron_roster
            ) AS B 
            ON A.patron_id=B.patron_id
            ;
    COMMIT;
END //
DELIMITER ;
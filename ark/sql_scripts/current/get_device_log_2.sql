DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE get_device_log(account_id_as_hex VARCHAR(36), device_id_as_hex VARCHAR(36))
BEGIN NOT ATOMIC
	DECLARE account_id_as_bin, organization_id_as_bin, device_id_as_bin VARBINARY(16);
    DECLARE count INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
    START TRANSACTION;
        -- Convert Hex (ease of use) to VARBINARY (storage format)
        SET account_id_as_bin = (SELECT UUID_TO_BIN(account_id_as_hex, 0));
        SET organization_id_as_bin = (SELECT organization_id FROM organization_accounts WHERE account_id=account_id_as_bin);
        SET device_id_as_bin = (SELECT UUID_TO_BIN(device_id_as_hex, 0));

        SET count = (
            SELECT COUNT(*) FROM 
            devices 
            WHERE 
            device_id=device_id_as_bin
            AND 
            organization_id=organization_id_as_bin
            );
        IF (count > 0) THEN

            SELECT
                tx_id,
                patron_id,
                bsid,
                fname,
                lname,
                action, 
                L.name as action_location,
                BIN_TO_UUID(L.account_id, 0) as location_id,
                date, 
                notes
            FROM
                (
                SELECT
                    account_id,
                    name
                FROM
                    organization_accounts
                WHERE
                    (account_id=account_id_as_bin)
                )
            AS L
            RIGHT JOIN
                (
                SELECT 
                    tx_id,
                    BIN_TO_UUID(D.patron_id, 0) as patron_id,
                    bsid,
                    fname,
                    lname,
                    action, 
                    action_location,
                    date, 
                    notes
                FROM
                    (
                    SELECT
                        tx_id,
                        patron_id,
                        action,
                        action_location,
                        date,
                        notes
                    FROM logs
                    WHERE (device_id=device_id_as_bin)
                    )
                AS D
                LEFT JOIN
                    (
                    SELECT
                        patron_id,
                        fname,
                        lname,
                        bsid
                    FROM patron_roster
                    WHERE (organization_id=organization_id_as_bin)
                    ) 
                AS P
                ON D.patron_id=P.patron_id
                )
            AS M
            ON 
            L.account_id=M.action_location
            ;

            ELSE
                SELECT
                    tx_id,
                    BIN_TO_UUID(patron_id, 0),
                    action,
                    BIN_TO_UUID(action_location, 0),
                    date,
                    notes
                FROM logs
                WHERE
                1=0
                ;
        END IF;
    COMMIT;
END //
DELIMITER ;
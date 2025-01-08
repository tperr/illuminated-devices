DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE get_patron_log(account_id_as_hex VARCHAR(36), patron_id_as_hex VARCHAR(36))
BEGIN NOT ATOMIC
	DECLARE account_id_as_bin, organization_id_as_bin, patron_id_as_bin VARBINARY(16);
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
        SET patron_id_as_bin = (SELECT UUID_TO_BIN(patron_id_as_hex, 0));

        SET count = (
            SELECT COUNT(*) FROM 
            patron_roster 
            WHERE 
            patron_id=patron_id_as_bin
            AND 
            organization_id=organization_id_as_bin
            );
        IF (count > 0) THEN
            
            SELECT
                M.tx_id,
                BIN_TO_UUID(M.device_id, 0) as device_id, 
                M.bsid,
                M.name,
                M.action,
                L.name as action_location,
                BIN_TO_UUID(L.account_id, 0) as location_id, 
                M.date,
                M.notes
            FROM
                (
                    SELECT 
                        account_id,
                        name
                    FROM
                        organization_accounts
                    WHERE 
                        account_id=account_id_as_bin
                )
            AS L
            RIGHT JOIN 
            (
                SELECT
                    P.tx_id,
                    P.device_id,
                    D.bsid,
                    D.name,
                    P.action,
                    P.action_location,
                    P.date,
                    P.notes
                FROM
                    (
                        SELECT
                            tx_id,
                            patron_id,
                            device_id,
                            action,
                            action_location,
                            date,
                            notes
                        FROM
                            logs
                        WHERE
                            patron_id=patron_id_as_bin
                    )
                AS P
                LEFT JOIN
                    (
                        SELECT 
                            device_id,
                            bsid,
                            name
                        FROM
                            devices
                        WHERE
                            organization_id=organization_id_as_bin
                    )
                AS D
                ON P.device_id=D.device_id
            )
            AS M
            ON L.account_id=M.action_location
            ;
            
            ELSE
                SELECT
                *
                FROM logs
                WHERE
                1=0
                ;
        END IF;
    COMMIT;
END //
DELIMITER ;
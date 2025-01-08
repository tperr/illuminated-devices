DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE get_organization_locations(account_id_as_hex VARCHAR(36))
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
            name,
            phone,
            email,
            street_address,
            city,
            state,
            zip, 
            registration_date,
            bsid,
            BIN_TO_UUID(account_id, 0) as account_id,
            BIN_TO_UUID(organization_id_as_bin, 0) as organization_id
        FROM organization_accounts
        WHERE (organization_id=organization_id_as_bin)
        ;
    COMMIT;
END //
DELIMITER ;
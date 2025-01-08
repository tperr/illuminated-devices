DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE get_all_organizations()
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            SELECT 
                BIN_TO_UUID(account_id, 0),
                name,
                phone,
                email,
                street_address,
                city,
                state,
                registration_date,
                BIN_TO_UUID(organization_id, 0),
                bsid,
                zip
            FROM organization_accounts;
        END;
END //
DELIMITER ;

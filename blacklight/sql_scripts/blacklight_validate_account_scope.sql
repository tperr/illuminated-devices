DELIMITER //
USE blacklight //
CREATE OR REPLACE FUNCTION blacklight_validate_account_scope(uuid VARCHAR(16)) RETURNS INT
        BEGIN
	        RETURN (SELECT account_scope FROM accounts WHERE id=uuid);
	END //
DELIMITER ;

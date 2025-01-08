DELIMITER //
USE blacklight //
CREATE OR REPLACE FUNCTION blacklight_validate_access_token(a_token VARBINARY(16), a_scope INT) RETURNS TINYINT(1)
        BEGIN
		RETURN (SELECT COUNT(*) FROM accounts WHERE id=(SELECT id FROM access_tokens WHERE token=a_token AND expiration>NOW()) AND account_scope=a_scope);
	END //
DELIMITER ;

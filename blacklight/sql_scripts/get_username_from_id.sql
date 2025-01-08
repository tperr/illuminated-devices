DELIMITER //
USE blacklight //
CREATE OR REPLACE PROCEDURE get_username_from_id(account_id_as_hex VARCHAR(36))
BEGIN
	DECLARE account_id_as_bin VARBINARY(16);
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
		SELECT "server_error";
	END;
	START TRANSACTION;
	-- Convert Hex (ease of use) to VARBINARY (storage format)
	SET account_id_as_bin = (SELECT UUID_TO_BIN(account_id_as_hex, 0));
	
	-- Pull account username
	SELECT username
	FROM accounts 
	WHERE (id=account_id_as_bin);

	COMMIT;
END //
DELIMITER ;

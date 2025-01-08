DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE get_account_details(account_id_as_hex VARCHAR(36))
BEGIN
	DECLARE account_id_as_bin VARBINARY(16);
	DECLARE this_account_scope INT;
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
		SELECT "server_error";
	END;
	START TRANSACTION;
	-- Convert Hex (ease of use) to VARBINARY (storage format)
	SET account_id_as_bin = (SELECT UUID_TO_BIN(account_id_as_hex, 0));

	-- Get account scope
	SET this_account_scope = (SELECT account_scope FROM accounts WHERE account_id=account_id_as_bin);
	
	-- Pull account details
	IF (this_account_scope = 1) THEN	-- Admin account
		SELECT "server_errorADMIN";
		-- SELECT 1 as account_scope, fname, lname, phone, email, FLOOR(UNIX_TIMESTAMP(registration_date)) as registration_date  -- registration date as Unix timestamp
		-- FROM admin_accounts 
		-- WHERE (account_id=account_id_as_bin);

	ELSEIF (this_account_scope = 2) THEN	-- Tutor account
		SELECT 2 AS account_scope, fname, lname, phone, email, FLOOR(UNIX_TIMESTAMP(registration_date)) AS registration_date  -- registration date as Unix timestamp
		FROM tutor_accounts 
		WHERE (account_id=account_id_as_bin) AND (is_supertutor=TRUE);

	ELSEIF (this_account_scope = 3) THEN	-- Super Tutor account
		SELECT 3 AS account_scope, fname, lname, phone, email, FLOOR(UNIX_TIMESTAMP(registration_date)) AS registration_date  -- registration date as Unix timestamp
		FROM tutor_accounts 
		WHERE (account_id=account_id_as_bin);

	ELSEIF (this_account_scope = 4) THEN 	-- Organization and Location accounts
		SELECT 4 AS account_scope, name, phone, email, FLOOR(UNIX_TIMESTAMP(registration_date)) AS registration_date  -- registration date as Unix timestamp
		FROM organization_accounts
		WHERE (account_id=account_id_as_bin);

	ELSEIF (this_account_scope = 5) THEN	-- Location accounts
		SELECT 5 AS account_scope, name, phone, email, FLOOR(UNIX_TIMESTAMP(registration_date)) AS registration_date  -- registration date as Unix timestamp
		FROM organization_accounts
		WHERE (account_id=account_id_as_bin);

	ELSEIF (this_account_scope = 0) THEN 	-- Developer account
		SELECT 0 AS account_scope, fname, lname, phone, email, FLOOR(UNIX_TIMESTAMP(registration_date)) AS registration_date  -- registration date as Unix timestamp
		FROM developer_accounts 
		WHERE (account_id=account_id_as_bin);

	ELSEIF (this_account_scope = 6) THEN   -- Device account
		SELECT 6 AS account_scope;

	ELSE 	-- invalid account
		SELECT "server_error";
	END IF;

	COMMIT;
END //
DELIMITER ;

DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE get_tutor_profile(t_id_as_hex VARCHAR(36))
BEGIN
	DECLARE t_id VARBINARY(16);
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
	END;
	START TRANSACTION;
	      SET t_id = (SELECT UUID_TO_BIN(t_id_as_hex, 0));
	      SELECT BIN_TO_UUID(account_id, 0) as user_id, fname, lname, phone, email, FLOOR(UNIX_TIMESTAMP(registration_date)) as registration_date
	      FROM accounts
	      WHERE account_id=t_id
	      AND account_scope=2
	      ;
	COMMIT;
END //
DELIMITER ;

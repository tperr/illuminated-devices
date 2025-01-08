DELIMITER //
USE blacklight //
CREATE OR REPLACE PROCEDURE get_authorization_code(c_id BIGINT(20) UNSIGNED, r_uri VARCHAR(80), u VARCHAR(20), p CHAR(64), c_chal CHAR(64), c_met ENUM('S256', 'plain'))
       BEGIN NOT ATOMIC
       DECLARE uuid, auth_code VARBINARY(16);
       DECLARE this_account_scope INT;
       DECLARE EXIT HANDLER FOR SQLEXCEPTION
       	       BEGIN
	               SELECT "server_error";
		       ROLLBACK;
	       END;
        START TRANSACTION;
	SET uuid = (SELECT blacklight_validate_uuid(u, p));
	IF ISNULL(uuid) THEN
	        SELECT "access_denied";
	ELSE
	        SET this_account_scope = (SELECT blacklight_validate_account_scope(uuid));
	        SET auth_code = UUID_TO_BIN(UUID(), 0);
		INSERT INTO auth_codes (authorization_code, client_id, redirect_uri, account_scope, id, code_challenge, code_challenge_method) VALUES (auth_code, c_id, r_uri, this_account_scope, uuid, c_chal, c_met);
		SELECT BIN_TO_UUID(auth_code, 0);
	END IF;
	COMMIT;
        END //
DELIMITER ;

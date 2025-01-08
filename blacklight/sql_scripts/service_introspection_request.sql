DELIMITER //
USE blacklight //
CREATE OR REPLACE PROCEDURE service_introspection_request(ark_id BIGINT(20) UNSIGNED, ark_secret CHAR(64), access_token CHAR(36), a_scope INT)
        BEGIN NOT ATOMIC
        DECLARE ark_is_valid, token_is_valid TINYINT(1);
	DECLARE bin VARBINARY(16);
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
                BEGIN
                        SELECT "server_error"
		        ROLLBACK;
	        END;
	START TRANSACTION;
	SET bin = (SELECT UUID_TO_BIN(access_token, 0));
        SET ark_is_valid = (SELECT blacklight_validate_ark(ark_id, ark_secret));
	IF (ark_is_valid > 0) THEN
	        SET token_is_valid = (SELECT blacklight_validate_access_token(bin, a_scope));
		IF (token_is_valid > 0) THEN
		        SELECT U.id AS id, U.account_scope AS scope, T.token AS token, T.expiration AS expires_at FROM (SELECT id, token, expiration FROM access_tokens WHERE token=bin) AS T INNER JOIN (SELECT id, account_scope FROM accounts WHERE account_scope=a_scope) AS U ON T.id=U.id;
		ELSE
		        SELECT "invalid_token";
		END IF;
	ELSE
	        SELECT "invalid_request_ark_credentials";
        END IF;
	COMMIT;
        END //
DELIMITER ; 

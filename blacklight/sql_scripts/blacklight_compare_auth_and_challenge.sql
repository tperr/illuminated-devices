DELIMITER //
USE blacklight //
CREATE OR REPLACE FUNCTION blacklight_compare_auth_and_challenge(auth_code VARBINARY(16), code_chal CHAR(64)) RETURNS INT
        BEGIN
	        -- Ensuring that the code verifier provided with the authorization code matches the saved code challenge
		RETURN (SELECT COUNT(*) FROM auth_codes WHERE authorization_code=auth_code AND code_challenge=code_chal);
	END //
DELIMITER ;

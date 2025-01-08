DELIMITER //
USE blacklight //
CREATE OR REPLACE FUNCTION blacklight_validate_auth_is_fresh(auth_code VARBINARY(16)) RETURNS INT
        BEGIN
		DECLARE used INT;
	        -- If the auth code is fresh, return 0
		-- If it does not exist or it has already expired, return 1
	        IF ((SELECT COUNT(*) FROM (SELECT * FROM auth_codes WHERE authorization_code=auth_code AND expiration>NOW()) as T) > 0) THEN
		        -- If the auth_code has already been used, return 2
			-- Otherwise, return 0
			SET used = (SELECT used FROM auth_codes WHERE authorization_code=auth_code);
		        IF (used  > 0) THEN
			        RETURN 2;
			ELSE
			        RETURN 0;
			END IF;
		ELSE
		        RETURN 1;
		END IF;
	END // 
DELIMITER ;

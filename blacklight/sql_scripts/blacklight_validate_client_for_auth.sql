DELIMITER //
USE blacklight //
CREATE OR REPLACE FUNCTION blacklight_validate_client_for_auth(c_id BIGINT(20) UNSIGNED, r_uri VARCHAR(80), auth_code VARBINARY(16)) RETURNS VARBINARY(16)
        BEGIN
	        -- Ensuring that the authorization grant was issued to the client_id/redirect_uri pair
	        RETURN (SELECT id FROM auth_codes WHERE client_id=c_id AND redirect_uri=r_uri AND authorization_code=auth_code);
	END //
DELIMITER ;

DELIMITER //
USE blacklight //
CREATE OR REPLACE PROCEDURE authenticate_client(c_id BIGINT(20) UNSIGNED, r_uri VARCHAR(80))
BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER
        FOR SQLEXCEPTION
        BEGIN
                SELECT "server_error";
                ROLLBACK;
	END;
        START TRANSACTION;
	        IF (SELECT blacklight_validate_client(c_id, r_uri)) > 0 THEN
	                SELECT "authorized_client";
	        ELSE
	                SELECT "unauthorized_client";
	        END IF;
	COMMIT;
END //
DELIMITER ;

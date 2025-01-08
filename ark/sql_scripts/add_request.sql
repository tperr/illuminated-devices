DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE add_request(uuid CHAR(36))
        BEGIN NOT ATOMIC
	        DECLARE EXIT HANDLER FOR SQLEXCEPTION
		BEGIN
		        ROLLBACK;
	        END;
		START TRANSACTION;
                        SELECT ark_add_request(UUID_TO_BIN(uuid, 0));
                COMMIT;
	END //
DELIMITER ;

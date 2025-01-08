DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE service_request(r_id INT, t_uuid CHAR(36))
BEGIN NOT ATOMIC
	DECLARE t_id VARBINARY(16);
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
		BEGIN
			ROLLBACK;
		END;
	START TRANSACTION;
	-- t_uuid to VARBINARY
	SET t_id = UUID_TO_BIN(t_uuid, 0);
	
	-- Acquire locks
	SELECT * FROM requests WHERE request_id=r_id FOR UPDATE;
	SELECT * FROM tutor_roster WHERE tutor_id=t_id FOR UPDATE;

        -- Check that tutor is still available 
	IF (SELECT available FROM tutor_roster WHERE tutor_id=t_id) > 0 THEN
	        -- Update
		UPDATE tutor_roster SET available=0 WHERE tutor_id=t_id;
		UPDATE requests SET serviced=1, tutor_id=t_id WHERE request_id=r_id;
		COMMIT;
		SELECT True;
	ELSE
	        -- Tutor unavailable
		ROLLBACK;
		SELECT False;
	END IF;
	COMMIT; -- Just in case
END //
DELIMITER ;

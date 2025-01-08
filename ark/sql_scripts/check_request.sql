DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE check_request(req INT)
BEGIN NOT ATOMIC
        DECLARE t_id VARBINARY(16);
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
	        ROLLBACK;
	END;
	START TRANSACTION;
	        SET t_id = (SELECT tutor_id FROM requests WHERE request_id=req);
	        IF ISNULL(t_id) THEN
		        SELECT * FROM requests WHERE 1=0;
	        ELSE
	                SELECT meetingNumber, meetingPassword FROM tutor_roster WHERE tutor_id=t_id;
		END IF;
	COMMIT;
END //
DELIMITER ;

DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE get_all_patrons()
BEGIN
	SELECT (BIN_TO_UUID(patron_id, 0)) as patron_hex_id, fname, lname, phone, email, FLOOR(UNIX_TIMESTAMP(registration_date)) as registration_date FROM patron_roster;
END //
DELIMITER ;

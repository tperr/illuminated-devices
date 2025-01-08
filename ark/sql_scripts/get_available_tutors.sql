DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE get_available_tutors()
BEGIN
	-- Can easily change this to get more information from roster if we need
	-- e.g., "specialties" or something
        SELECT fname, lname
	FROM accounts
	INNER JOIN tutor_roster
	ON accounts.account_id=tutor_roster.tutor_id
	WHERE available=1;
END //
DELIMITER ;

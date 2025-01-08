DELIMITER //
USE ark //
CREATE OR REPLACE FUNCTION ark_validate_available_tutor(t_id VARCHAR(10)) RETURNS INT
       BEGIN
               RETURN (SELECT COUNT(*) FROM (SELECT * FROM tutor_roster WHERE tutor_id=t_id AND available=1) AS T);
       END //
DELIMITER ;

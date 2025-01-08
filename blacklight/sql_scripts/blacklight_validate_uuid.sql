DELIMITER //
USE blacklight //
CREATE OR REPLACE FUNCTION blacklight_validate_uuid(u VARCHAR(20), p CHAR(64)) RETURNS VARBINARY(16)
       BEGIN
                RETURN (SELECT id FROM accounts WHERE username=u AND password=p AND active=1); -- remove AND active=1 if you remove the active column
       END //
DELIMITER ;

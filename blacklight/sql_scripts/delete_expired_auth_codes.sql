DELIMITER ;
USE blacklight;
CREATE OR REPLACE DEFINER=kirk@localhost EVENT delete_expired_auth_codes
ON SCHEDULE EVERY 5 MINUTE
DO
        DELETE FROM auth_codes WHERE expiration<(NOW()-INTERVAL 1 MINUTE);

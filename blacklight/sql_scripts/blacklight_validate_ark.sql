DELIMITER //
USE blacklight //
CREATE OR REPLACE FUNCTION blacklight_validate_ark(ark_id BIGINT(20) UNSIGNED, ark_secret CHAR(64)) RETURNS TINYINT(1)
        BEGIN
	        RETURN (SELECT COUNT(*) FROM ark_listings WHERE id=ark_id AND secret=ark_secret);
	END //
DELIMITER ;

DELIMITER //
USE blacklight //
CREATE OR REPLACE FUNCTION blacklight_validate_client(c_id BIGINT(20) UNSIGNED, r_uri VARCHAR(80)) RETURNS INT
       BEGIN
               RETURN (SELECT COUNT(*) FROM (SELECT * FROM client_listings WHERE id=c_id AND redirection_endpoint=r_uri AND active=1) AS C);
       END //
DELIMITER ;

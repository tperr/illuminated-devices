DELIMITER //
use blacklight //
CREATE OR REPLACE PROCEDURE delete_refresh_token(r_token CHAR(36))
    BEGIN NOT ATOMIC
        DECLARE token_as_bin VARBINARY(16);

        DECLARE EXIT HANDLER FOR SQLEXCEPTION
            BEGIN
                SELECT "server_error";
                ROLLBACK;
            END;

        START TRANSACTION;
            SET token_as_bin = UUID_TO_BIN(r_token, 0);

            DELETE FROM refresh_tokens WHERE refresh_token=token_as_bin;
        COMMIT;
    END //
DELIMITER ; 

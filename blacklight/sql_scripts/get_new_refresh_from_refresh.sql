DELIMITER //
use blacklight //
CREATE OR REPLACE PROCEDURE get_new_refresh_from_refresh(r_token CHAR(36))
    BEGIN NOT ATOMIC
        DECLARE new_token, old_token, u_id VARBINARY(16);
        DECLARE active_state TINYINT(1);

        DECLARE EXIT HANDLER FOR SQLEXCEPTION
            BEGIN
                SELECT "temporarily_unavailable"; -- Change to server_error
                ROLLBACK;
            END;

        START TRANSACTION;
            SET old_token = UUID_TO_BIN(r_token, 0);
            SET u_id = (SELECT id FROM refresh_tokens WHERE refresh_token=old_token);
            IF ISNULL(u_id) THEN
                -- If u_id is null then this refresh_token has expired, since been refreshed, or never existed to begin with
                SELECT "invalid_token";
            ELSE
		SET active_state = (SELECT active FROM accounts WHERE id=u_id AND active=1);

                IF ISNULL(active_state) THEN
                    SELECT "invalid_token";
                ELSE
                    -- The u_id is not null, so we have the user who the refresh_token belongs to
                    -- We want to refresh this token for this user
                    SET new_token = UUID_TO_BIN(UUID(), 0);

                    -- Update refresh_token
                    UPDATE refresh_tokens
                    SET refresh_token=new_token
                    WHERE refresh_token=old_token;

                    -- Update refresh_token's expiration
                    UPDATE refresh_tokens
                    SET expiration=(current_timestamp() + interval 1 month)
                    WHERE refresh_token=new_token;

                    -- We don't change the auth code
                END IF;
            END IF;
        COMMIT;
        START TRANSACTION;
            -- Return the entry
            SELECT T.refresh_token, T.expiration, T.id, A.account_scope
            FROM
            (SELECT refresh_token, expiration, id FROM refresh_tokens WHERE refresh_token=new_token) AS T
            INNER JOIN
            (SELECT id, account_scope FROM accounts WHERE id=u_id) AS A
            ON T.id=A.id;
        COMMIT; 
    END //
DELIMITER ; 

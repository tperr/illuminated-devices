DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE tutor_get_chats(t_id_as_hex VARBINARY(36))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DECLARE t_id VARBINARY(16);
            SET t_id = (SELECT UUID_TO_BIN(t_id_as_hex, 0));

            DELETE FROM tutor_chats -- removes old chats, old if 1 or more hours old
            WHERE TIMESTAMPDIFF(HOUR, time, NOW()) > 0;

            -- grabs chat and account information
            SELECT DISTINCT
                BIN_TO_UUID(c.tutor_from, 0) as tutor_from,
                BIN_TO_UUID(c.tutor_to, 0) as tutor_to,
                message,
                time
            FROM tutor_chats c
            LEFT JOIN
            (SELECT * FROM tutor_accounts) a
            ON c.tutor_from=a.account_id
            OR c.tutor_to=a.account_id
            WHERE tutor_from=t_id or tutor_to=t_id
            ORDER BY time;

            
        END;
END //

CREATE OR REPLACE PROCEDURE tutor_get_chats_bin(t_id VARBINARY(16))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            -- makes sure theyre online
            UPDATE tutor_accounts SET is_online=1, last_online=NOW() 
            WHERE account_id = t_id;

            -- updates if anyone is not onlinne
            UPDATE tutor_accounts SET is_online=0 
            WHERE TIMESTAMPDIFF(SECOND, last_online, NOW()) > 10;

            DELETE FROM tutor_chats -- removes old chats
            WHERE TIMESTAMPDIFF(HOUR, time, NOW()) > 5;

            -- grabs chat and account information
            SELECT 
                BIN_TO_UUID(c.tutor_from, 0) as tutor_from,
                BIN_TO_UUID(c.tutor_to, 0) as tutor_to,
                message,
                time,
                BIN_TO_UUID(a.account_id, 0) as account_id,
                fname,
                lname,
                email,
                is_online,
                last_online,
                is_available
            FROM tutor_chats c
            LEFT JOIN
            (SELECT * FROM tutor_accounts) a
            ON c.tutor_from=a.account_id
            OR c.tutor_to=a.account_id
            WHERE tutor_from=t_id or tutor_to=t_id
            ORDER BY time;
            
        END;
END //
DELIMITER ;

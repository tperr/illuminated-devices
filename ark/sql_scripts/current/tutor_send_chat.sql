DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE tutor_send_chat(t_id_as_hex_from VARBINARY(36), t_id_as_hex_to VARBINARY(36), msg VARCHAR(1024))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DECLARE t_id_from VARBINARY(16);
            DECLARE t_id_to VARBINARY(16);
            SET t_id_from = (SELECT UUID_TO_BIN(t_id_as_hex_from, 0));
            SET t_id_to = (SELECT UUID_TO_BIN(t_id_as_hex_to, 0));
           
            INSERT INTO 
            tutor_chats(tutor_from, tutor_to, message, time) 
            VALUES (t_id_from, t_id_to, msg, NOW());
            
            SELECT "SUCCESS";
        END;
END //

CREATE OR REPLACE PROCEDURE tutor_send_chat_bin(t_id_from VARBINARY(16), t_id_to VARBINARY(16), msg VARCHAR(1024))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
           
            INSERT INTO 
            tutor_chats(tutor_from, tutor_to, message, time) 
            VALUES (t_id_from, t_id_to, msg, NOW());
            
            SELECT "SUCCESS";
        END;
END //
DELIMITER ;


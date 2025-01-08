DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE tutor_add_patron_note(p_id_as_hex VARBINARY(36), t_id_as_hex_to VARBINARY(36), msg VARCHAR(1024))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DECLARE p_id VARBINARY(16);
            SET p_id = (SELECT UUID_TO_BIN(p_id_as_hex, 0));
           
            INSERT INTO 
                patron_notes(patron_id, note) 
            VALUES (t_id_from, t_id_to, msg, NOW());
            
            SELECT "SUCCESS";
        END;
END //

CREATE OR REPLACE PROCEDURE tutor_add_patron_note_bin(p_id VARBINARY(16), t_id_as_hex_to VARBINARY(36), msg VARCHAR(1024))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            CALL tutor_add_patron_note(UUID_TO_BIN(p_id, 0));
            
            SELECT "SUCCESS";
        END;
END //
DELIMITER ;


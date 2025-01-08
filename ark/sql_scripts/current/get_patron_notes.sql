DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE get_patron_notes(p_id_as_hex VARBINARY(36))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DECLARE p_id VARBINARY(16);
            SET p_id = (SELECT UUID_TO_BIN(p_id_as_hex, 0));
        SELECT 
            id,
            BIN_TO_UUID(patron_id, 0) as patron_id,
            note,
            note_date
        FROM
            patron_notes  
        WHERE
            patron_id = p_id  
        ORDER BY note_date;

        END;
END //
DELIMITER ;

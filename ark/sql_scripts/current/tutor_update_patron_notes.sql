DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE tutor_updat_patron_notes(note_id mediumint(9), p_id_as_hex VARBINARY(36), notes varchar(2047))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DECLARE p_id VARBINARY(16);
            SET p_id = (SELECT UUID_TO_BIN(p_id_as_hex, 0));

            IF p_id_as_hex = 0 THEN
                DELETE FROM patron_notes WHERE id=note_id;
            ELSEIF note_id = 0 AND notes != '' THEN
                INSERT INTO patron_notes(patron_id, note) values (p_id, notes);
            ELSE
                UPDATE patron_notes SET note=notes, note_date=NOW() WHERE id=note_id AND note != notes;
            END IF;
                       
            SELECT "SUCCESS";
        END;
END //
DELIMITER ;


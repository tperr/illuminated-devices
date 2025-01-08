DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE tutor_del_patron_note(note_id VARBINARY(36))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DELETE FROM patron_notes WHERE id=note_id;
        END;
END //
DELIMITER ;

DELIMITER //
USE ark //
CREATE OR REPLACE FUNCTION subroutine_patron_join_queue(p_id_as_hex VARBINARY(36), topic varchar(200), pwd varchar(10)) RETURNS INT
    BEGIN
        DECLARE p_id VARBINARY(16);
        DECLARE m_id MEDIUMINT(9);
        SET p_id = (SELECT UUID_TO_BIN(p_id_as_hex, 0));
        set m_id = (select meeting_id from meeting_queue where patron_id = p_id);
        
        IF m_id THEN -- this means that they were dropped prematurely
            UPDATE meeting_queue SET patron_dropped = 0, in_meeting = 1 WHERE meeting_id = m_id;
        ELSE
            INSERT INTO meeting_queue 
            (patron_id, topic, pwd, patron_dropped, tutor_dropped, in_meeting) 
            VALUES ( p_id, topic, pwd, 0, 0, 0 );
        END IF;
        RETURN (SELECT meeting_id FROM meeting_queue WHERE patron_id = p_id);
    END //

CREATE OR REPLACE PROCEDURE patron_join_queue(p_id_as_hex VARBINARY(36), topic varchar(200), pwd varchar(10))
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            SELECT subroutine_patron_join_queue(p_id_as_hex, topic, pwd);
        END;
END //
DELIMITER ;

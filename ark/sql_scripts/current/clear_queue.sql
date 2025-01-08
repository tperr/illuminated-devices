DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE clear_queue()
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            DELETE FROM meeting_queue;
            SELECT "SUCCESS";
        END;
END //
DELIMITER ;

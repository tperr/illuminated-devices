DELIMITER //
USE ark //

CREATE OR REPLACE PROCEDURE get_tutors()
    BEGIN NOT ATOMIC
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            SELECT "server_error";
            ROLLBACK;
        END;
        BEGIN
            select 
                BIN_TO_UUID(account_id, 0) as account_id,
                fname,
                lname, 
                phone, 
                email, 
                is_supertutor, 
                is_online, 
                last_online, 
                is_available
            from tutor_accounts;
        END;
END //
DELIMITER ;

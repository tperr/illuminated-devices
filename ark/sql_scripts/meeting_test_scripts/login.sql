DELIMITER //
CREATE OR REPLACE PROCEDURE test_login(nname VARCHAR(30), role CHAR(1))
BEGIN
    START TRANSACTION;

    IF role = '1' THEN
        INSERT INTO test_tutors (name) VALUES (nname);
    END IF;

    IF role = '0' THEN
        INSERT INTO test_patrons (name, priority) VALUES (nname, NOW());
    END IF;

    COMMIT;
END //
DELIMITER ;

create or replace table test_tutors (name varchar(30), meetingid MEDIUMINT);
create or replace table test_patrons (name varchar(30), meetingid MEDIUMINT, priority timestamp);
create or replace table test_meetings (
    meetingid MEDIUMINT not null AUTO_INCREMENT, 
    topic varchar(200), 
    session_key varchar(36), 
    pwd varchar(10), 
    PRIMARY KEY (meetingid));
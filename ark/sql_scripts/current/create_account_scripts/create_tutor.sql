-- create the organization account
SET @username = "";
SET @password = @username; -- same username and password for simplicity
SET @fname = "";
SET @lname = "";
SET @phone = "";
SET @email = "";
SET @is_st = 1; -- 0 for regular tutor, 1 for ST

SET @scope = 3 - @is_st; -- 2 for ST, 3 for regular tutor, do not need to change this field

SET @uuid = UUID_TO_BIN(UUID(), 0);

USE blacklight;
INSERT INTO accounts (id, username, password, account_scope) VALUES (@uuid, @username, SHA2(@password, 256), @scope);
use ark;
INSERT INTO accounts (account_id, account_scope) VALUES (@uuid, @scope);
insert into tutor_accounts values (@uuid, @fname, @lname, @phone, @email, now(), @is_st, 0, now(), 1);
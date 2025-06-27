-- create the dev account
SET @username = "";
SET @password = "";
SET @fname = "";
SET @lname = "";
SET @phone = "";
SET @email = "";

SET @uuid = UUID_TO_BIN(UUID(), 0);

USE blacklight;
INSERT INTO accounts (id, username, password, account_scope) VALUES (@uuid, @username, SHA2(@password, 256), 0);
use ark;
INSERT INTO accounts (account_id, account_scope) VALUES (@uuid, 0);
insert into developer_accounts values (@uuid, @fname, @lname, @phone, @email, now());

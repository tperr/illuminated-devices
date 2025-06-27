
-- create the organization account
SET @org_name = "pldl";

SET @username = CONCAT(@org_name, "-master");
SET @password = @username; -- same username and password for simplicity
SET @name = @username;
SET @phone = "";
SET @email = "";
SET @street = "";
SET @city = "";
SET @state = "";
SET @zip = "";

SET @uuid_org = UUID_TO_BIN(UUID(), 0);

USE blacklight;
INSERT INTO accounts (id, username, password, account_scope) VALUES (@uuid_org, @username, SHA2(@password, 256), 4);
use ark;
INSERT INTO accounts (account_id, account_scope) VALUES (@uuid_org, 4);
insert into organization_accounts values (@uuid_org, @name, @phone, @email, @street, @city, @state, now(), @uuid_org, @uuid_org, @zip);

-- create the location account, where the location is the one that checks out devices
SET @username = @org_name;
SET @password = @username; -- ^^
SET @name = @username;
-- SET @phone = "";
-- SET @email = "";
-- SET @street = "";
-- SET @city = "";
-- SET @state = "";
-- SET @zip = "";

SET @uuid_loc = UUID_TO_BIN(UUID(), 0);

USE blacklight;
INSERT INTO accounts (id, username, password, account_scope) VALUES (@uuid_loc, @username, SHA2(@password, 256), 5);
use ark;
INSERT INTO accounts (account_id, account_scope) VALUES (@uuid_loc, 5);
insert into organization_accounts values (@uuid_loc, @name, @phone, @email, @street, @city, @state, now(), @uuid_org, @uuid_loc, @zip);

-- create the device account
SET @username = CONCAT(@org_name, "-devices");
SET @password = @username; -- ^^
SET @name = @username;
-- SET @phone = "";
-- SET @email = "";
-- SET @street = "";
-- SET @city = "";
-- SET @state = "";
-- SET @zip = "";

SET @uuid_dev = UUID_TO_BIN(UUID(), 0);

USE blacklight;
INSERT INTO accounts (id, username, password, account_scope) VALUES (@uuid_dev, @username, SHA2(@password, 256), 6);
use ark;
INSERT INTO accounts (account_id, account_scope) VALUES (@uuid_dev, 6);
insert into organization_accounts values (@uuid_dev, @name, @phone, @email, @street, @city, @state, now(), @uuid_org, @uuid_dev, @zip);
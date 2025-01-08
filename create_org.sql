use blacklight;

SET @uuid = UUID_TO_BIN(UUID(), 0);
SET @pldl = @uuid;
INSERT INTO accounts (id, username, password, account_scope) VALUES (@uuid, "pldl-master", SHA2("pldl-master", 256), 4);
use ark;
INSERT INTO accounts (account_id, account_scope) VALUES (@uuid, 4);
insert into organization_accounts values (@pldl, "pldl", "906 482 4570", "info@pldl.org", "58 Huron Street", "Houghton", "MI", now(), @pldl, @pldl, "49931");

use blacklight;
SET @uuid = UUID_TO_BIN(UUID(), 0);
INSERT INTO accounts (id, username, password, account_scope) VALUES (@uuid, "pldl", SHA2("pldl", 256), 5);
use ark;
INSERT INTO accounts (account_id, account_scope) VALUES (@uuid, 5);
insert into organization_accounts values (@uuid, "pldl", "906 482 4570", "info@pldl.org", "58 Huron Street", "Houghton", "MI", now(), @pldl, @uuid, "49931");

use blacklight;
SET @uuid = UUID_TO_BIN(UUID(), 0);
INSERT INTO accounts (id, username, password, account_scope) VALUES (@uuid, "pldl-devices", SHA2("pldl-devices", 256), 6);
use ark;
INSERT INTO accounts (account_id, account_scope) VALUES (@uuid, 6);
insert into organization_accounts values (@uuid, "pldl", "906 482 4570", "info@pldl.org", "58 Huron Street", "Houghton", "MI", now(), @pldl, @uuid, "49931");





use blacklight;
SET @uuid = UUID_TO_BIN(UUID(), 0);
SET @mtu = @uuid;
INSERT INTO accounts (id, username, password, account_scope) VALUES (@uuid, "mtu-master", SHA2("mtu-master", 256), 4);
use ark;
INSERT INTO accounts (account_id, account_scope) VALUES (@uuid, 4);
insert into organization_accounts values (@uuid, "mtu", "906 487 1885", "mtu4u@mtu.edu", "1400 Townsend Dr.", "Houghton", "MI", now(), @uuid, @uuid, "49931");

use blacklight;
SET @uuid = UUID_TO_BIN(UUID(), 0);
INSERT INTO accounts (id, username, password, account_scope) VALUES (@uuid, "mtu", SHA2("mtu", 256), 5);
use ark;
INSERT INTO accounts (account_id, account_scope) VALUES (@uuid, 5);
insert into organization_accounts values (@uuid, "mtu", "906 487 1885", "mtu4u@mtu.edu", "1400 Townsend Dr.", "Houghton", "MI", now(), @mtu, @uuid, "49931");

use blacklight;
SET @uuid = UUID_TO_BIN(UUID(), 0);
INSERT INTO accounts (id, username, password, account_scope) VALUES (@uuid, "mtu-devices", SHA2("mtu-devices", 256), 6);
use ark;
INSERT INTO accounts (account_id, account_scope) VALUES (@uuid, 6);
insert into organization_accounts values (@uuid, "mtu", "906 487 1885", "mtu4u@mtu.edu", "1400 Townsend Dr.", "Houghton", "MI", now(), @mtu, @uuid, "49931");

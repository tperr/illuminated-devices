DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE assign_device_to_patron_with_vendor(device_uuid_as_hex VARCHAR(36), patron_id_as_hex VARCHAR(36), vendor_id_as_hex VARCHAR(36))
BEGIN
	DECLARE device_uuid, patron_id, vendor_id VARBINARY(16);
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
		SELECT "server_error";
	END;
	START TRANSACTION;
	-- Convert Hex (ease of use) to VARBINARY (storage format)
	SET device_uuid = (SELECT UUID_TO_BIN(device_uuid_as_hex, 0));
	SET patron_id = (SELECT UUID_TO_BIN(patron_id_as_hex, 0));
	SET vendor_id = (SELECT UUID_TO_BIN(vendor_id_as_hex, 0));
	
	-- Insert the device with the patron assignment
	-- If the device already exists (duplicate key), update its entry instead
	INSERT INTO devices (identifierForVendor, vendor_id, patron_id)
	VALUES (device_uuid, vendor_id, patron_id)
	ON DUPLICATE KEY UPDATE vendor_id=vendor_id, patron_id=patron_id
	;

	COMMIT;
	SELECT "success";
END //
DELIMITER ;

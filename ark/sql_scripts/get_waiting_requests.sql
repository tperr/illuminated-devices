DELIMITER //
USE ark //
CREATE OR REPLACE PROCEDURE get_waiting_requests()
BEGIN
        SELECT requests.request_id, requests.request_time, patrons_with_devices.fname, patrons_with_devices.lname
	FROM
	      (SELECT identifierForVendor, request_id, request_time
	      FROM requests
	      WHERE serviced=0)
	      AS requests
	INNER JOIN
        	(SELECT device.identifierForVendor, patron.fname, patron.lname
        	FROM
	                (SELECT identifierForVendor, patron_id
	                FROM devices)
	                AS device
	        INNER JOIN
	                (SELECT fname, lname, patron_id
	                FROM patron_roster)
	                AS patron
	        ON device.patron_id=patron.patron_id)
	        AS patrons_with_devices
	ON requests.identifierForVendor=patrons_with_devices.identifierForVendor
	;
END //
DELIMITER ;
